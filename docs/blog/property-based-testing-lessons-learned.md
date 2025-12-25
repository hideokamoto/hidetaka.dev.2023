# プロパティベーステスト実装で学んだ8つの教訓：fast-checkで陥りがちな落とし穴と対策

## はじめに

プロパティベーステスト（Property-Based Testing, PBT）は、ランダムに生成された大量のテストケースで関数の性質を検証する強力なテスト手法です。最近、`fast-check`を使ってプロパティベーステストを実装する機会がありましたが、予想以上に多くの問題に遭遇しました。

この記事では、実際に発生した問題とその原因、そして同じ失敗を繰り返さないための設計原則をまとめます。PBTを初めて実装する開発者の方の参考になれば幸いです。

## プロパティベーステストとは

プロパティベーステストは、具体的な入力値ではなく、関数が満たすべき**性質（プロパティ）**を定義して検証するテスト手法です。

```typescript
// 従来のテスト（Example-Based Testing）
it('should format date correctly', () => {
  expect(formatDate('2024-01-15')).toBe('January 15, 2024')
})

// プロパティベーステスト
it('should always include year in output', () => {
  fc.assert(
    fc.property(
      fc.date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') }),
      (date) => {
        const result = formatDate(date)
        expect(result).toContain(date.getFullYear().toString())
      }
    )
  )
})
```

ランダムに生成された大量のテストケースで検証するため、エッジケースや予想外の入力値によるバグを発見しやすいのが特徴です。

## 実際に発生した8つの問題と対策

### 1. 非効率的なフィルターによるタイムアウト

#### 問題の症状

CIでテストがタイムアウト（5000ms）し、失敗していました。

```typescript
// ❌ 問題のあるコード
it('should return Japanese text for languages starting with "ja"', () => {
  fc.assert(
    fc.property(
      fc.string().filter((s) => s.startsWith('ja')), // 問題！
      (lang) => {
        const result = getPaginationText(lang, 'prev')
        expect(result).toBe('前へ')
      }
    )
  )
})
```

#### 原因分析

`fc.string().filter((s) => s.startsWith('ja'))`は、ランダムに文字列を生成して「"ja"で始まる」という条件に合うものだけを選びます。しかし、ランダムな文字列が"ja"で始まる確率は極めて低く（約1/676）、`fast-check`は何千回も生成を繰り返してようやく1つ見つかる状態です。

これにより、テストがタイムアウトするまでに十分なテストケースを生成できません。

#### 対策：構造化されたarbitrary設計

フィルターに頼らず、**構造化されたarbitrary**を使います。

```typescript
// ✅ 改善後のコード
it('should return Japanese text for languages starting with "ja"', () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.constant('ja'), // 1. 実際に使われる値
        fc.tuple(fc.constant('ja'), fc.string({ minLength: 1, maxLength: 1 }))
          .map(([prefix, suffix]) => prefix + suffix), // 2. "ja" + 1文字
        fc.tuple(fc.constant('ja'), fc.string({ minLength: 10, maxLength: 20 }))
          .map(([prefix, suffix]) => prefix + suffix), // 3. "ja" + 長い文字列
      ),
      (lang) => {
        const result = getPaginationText(lang, 'prev')
        expect(result).toBe('前へ')
      }
    )
  )
})
```

**設計原則**：
- **`fc.constantFrom`**: 実際に使われる具体的な値を列挙
- **`fc.tuple` + `fc.constant`**: 構造化されたデータを組み立てる
- **`fc.oneof`**: 複数の生成戦略を組み合わせる

### 2. 型安全性の無視

#### 問題の症状

TypeScriptの型エラーは出ませんが、実行時に`null`や`undefined`が渡される可能性がありました。

```typescript
// ❌ 問題のあるコード
it('should be idempotent', () => {
  fc.assert(
    fc.property(fc.string(), (str) => {
      const result1 = removeHtmlTags(str) // string | null | undefined
      const result2 = removeHtmlTags(result1 as string) // 危険な型アサーション！
      expect(result1).toBe(result2)
    })
  )
})
```

#### 原因分析

`removeHtmlTags`は`string | null | undefined`を返す可能性がありますが、`as string`で無理やり`string`型にキャストしていました。`str`が`null`や`undefined`の場合、`result1`も`null`や`undefined`になり、型アサーションは誤りです。

#### 対策：型アサーションを避ける

関数の型シグネチャを尊重し、型アサーションを使わないようにします。

```typescript
// ✅ 改善後のコード
it('should be idempotent', () => {
  fc.assert(
    fc.property(fc.string(), (str) => {
      const result1 = removeHtmlTags(str)
      const result2 = removeHtmlTags(result1) // そのまま渡す
      expect(result1).toBe(result2)
    })
  )
})
```

**設計原則**：
- **型アサーション（`as`）は避ける**: 関数の型シグネチャを尊重する
- **TypeScriptの型推論を活用**: コンパイラに任せる

### 3. 無効なテストデータの生成

#### 問題の症状

日付ソート関数のテストで、無効な日付文字列（例：`"a"`, `"foo"`）が生成され、`NaN`による予測不能な動作が発生していました。

```typescript
// ❌ 問題のあるコード
it('should handle events with same date', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1 }), // "a"や"foo"も生成される
      fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 10 }),
      (dateStr, ids) => {
        const events = ids.map((id) => createMockEvent(id, dateStr))
        const sorted = sortByEventDate(events)
        // dateStrが無効な場合、new Date(dateStr).getTime()はNaNになる
      }
    )
  )
})
```

#### 原因分析

任意の文字列を生成していたため、日付として解釈できない文字列が含まれていました。`new Date("a")`は`Invalid Date`を返し、`getTime()`は`NaN`になります。これにより、ソートの動作が予測不能になります。

#### 対策：有効なデータを生成するarbitraryを使う

日付を生成する場合は、`fc.date()`を使って有効な日付を生成し、それを文字列形式に変換します。

```typescript
// ✅ 改善後のコード
it('should handle events with same date', () => {
  fc.assert(
    fc.property(
      fc.date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') })
        .map((d) => {
          const year = d.getUTCFullYear()
          const month = String(d.getUTCMonth() + 1).padStart(2, '0')
          const day = String(d.getUTCDate()).padStart(2, '0')
          return `${year}-${month}-${day}` // 有効な日付文字列
        }),
      fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 10 }),
      (dateStr, ids) => {
        const events = ids.map((id) => createMockEvent(id, dateStr))
        const sorted = sortByEventDate(events)
        // dateStrは常に有効な日付形式
      }
    )
  )
})
```

**設計原則**：
- **ドメインに適したarbitraryを使う**: 日付なら`fc.date()`、URLなら`fc.webUrl()`など
- **無効なデータをフィルターする**: `.filter()`で除外するか、最初から有効なデータを生成する

### 4. タイムゾーンの不一致

#### 問題の症状

日付フォーマット関数のテストが、年境界付近でフレーキーに失敗していました。

```typescript
// ❌ 問題のあるコード
it('should include year in output', () => {
  fc.assert(
    fc.property(
      fc.date(),
      fc.string(),
      fc.constantFrom('short', 'long', 'month-year'),
      (date, lang, format) => {
        const result = formatDateDisplay(date, lang, format)
        const year = date.getFullYear().toString() // ローカルタイムゾーン
        expect(result).toContain(year)
      }
    )
  )
})
```

#### 原因分析

`formatDateDisplay`関数の`month-year`フォーマットは`timeZone: 'UTC'`を使用していますが、テストでは`date.getFullYear()`（ローカルタイムゾーン）で年を取得していました。

例えば、日本時間（UTC+9）で2023年12月31日23:00の日付は、UTCでは2024年1月1日08:00になります。ローカルタイムゾーンでは2023年、UTCでは2024年となり、テストが失敗します。

#### 対策：フォーマットに応じたタイムゾーンを使用

フォーマットがUTCを使用する場合は、UTCで年を取得します。

```typescript
// ✅ 改善後のコード
it('should include year in output', () => {
  fc.assert(
    fc.property(
      fc.date(),
      fc.string(),
      fc.constantFrom('short', 'long', 'month-year'),
      (date, lang, format) => {
        const result = formatDateDisplay(date, lang, format)
        // month-yearフォーマットはUTCを使用
        const year = format === 'month-year'
          ? date.getUTCFullYear().toString()
          : date.getFullYear().toString()
        expect(result).toContain(year)
      }
    )
  )
})
```

**設計原則**：
- **タイムゾーンを意識する**: 日付フォーマット関数がどのタイムゾーンを使うか確認する
- **テストデータと期待値のタイムゾーンを一致させる**: 比較する値は同じタイムゾーンで取得する

### 5. テスト説明の言語不一致

#### 問題の症状

テストの`describe`ブロックが日本語で書かれていましたが、コードベース全体は英語でした。

```typescript
// ❌ 問題のあるコード
describe('実際に使用される言語コード', () => {
  it('should return Japanese text', () => {
    // ...
  })
})

describe('境界値テスト', () => {
  // ...
})
```

#### 原因分析

開発者が日本語で説明を書いたため、コードベース全体の一貫性が損なわれていました。国際的なチームや将来のメンテナンスを考えると、英語で統一すべきです。

#### 対策：コードベースの言語に合わせる

プロジェクトの言語ポリシーに従い、英語に統一しました。

```typescript
// ✅ 改善後のコード
describe('common language codes', () => {
  it('should return Japanese text', () => {
    // ...
  })
})

describe('boundary value tests', () => {
  // ...
})
```

**設計原則**：
- **コードベースの言語ポリシーに従う**: プロジェクト全体で統一する
- **将来のメンテナンスを考慮**: 国際的なチームやOSS化を想定する

### 6. 大文字小文字の扱い

#### 問題の症状

言語コードの大文字小文字を区別する実装のバグが、テストで発見されませんでした。

```typescript
// 実装（lang.util.ts）
export const getPathnameWithLangType = (targetPath: string, lang: string): string => {
  if (/en/.test(lang)) return `/${targetPath}` // 大文字小文字を区別
  if (/ja/.test(lang)) return `/ja-JP/${targetPath}` // 大文字小文字を区別
  return `/${lang}/${targetPath}`
}

// ❌ 問題のあるテスト
it('should return path with /ja-JP/ prefix', () => {
  fc.assert(
    fc.property(
      fc.string(),
      fc.constantFrom('ja', 'ja-JP'), // 小文字のみ
      (targetPath, lang) => {
        const result = getPathnameWithLangType(targetPath, lang)
        expect(result).toMatch(/^\/ja-JP\//)
      }
    )
  )
})
```

`getPathnameWithLangType('path', 'JA')`を呼ぶと、`/JA/path`が返されますが、期待値は`/ja-JP/path`です。しかし、テストでは大文字のケースをカバーしていませんでした。

#### 対策：バグを暴露するテストを追加

大文字小文字のバリエーションをテストし、現在の実装のバグを明示的に文書化します。

```typescript
// ✅ 改善後のコード
it('should return path with /ja-JP/ prefix for common Japanese language codes', () => {
  fc.assert(
    fc.property(
      fc.string(),
      fc.constantFrom('ja', 'ja-JP', 'japanese', 'ja_JP'), // 小文字のみ
      (targetPath, lang) => {
        const result = getPathnameWithLangType(targetPath, lang)
        expect(result).toMatch(/^\/ja-JP\//)
      }
    )
  )
})

it('should handle case-sensitivity: uppercase language codes expose bug', () => {
  fc.assert(
    fc.property(
      fc.string(),
      fc.constantFrom('JA', 'JA-JP', 'Ja', 'Ja-JP'), // 大文字・混合ケース
      (targetPath, lang) => {
        const result = getPathnameWithLangType(targetPath, lang)
        // 現在の実装のバグを文書化
        // 大文字'JA'は/ja/にマッチしないため、/JA/targetPathが返される
        // 期待される動作: /ja-JP/targetPath
        expect(result).toBe(`/${lang}/${targetPath}`) // 現在のバグのある動作
      }
    )
  )
})
```

**設計原則**：
- **エッジケースをカバーする**: 大文字小文字、空文字列、特殊文字など
- **既知のバグを文書化**: テストコメントで現在の動作と期待される動作を明記する

### 7. 長い文字列のエッジケース

#### 問題の症状

長い文字列を生成するテストで、文字列が`"ja"`で始まる可能性を考慮していませんでした。

```typescript
// ❌ 問題のあるコード
it('should handle edge cases', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 50, maxLength: 100 }), // "ja"で始まる可能性がある
      (lang) => {
        const result = getPaginationText(lang, 'prev')
        expect(result).toBe('Previous') // 常に英語を期待
      }
    )
  )
})
```

`fc.string({ minLength: 50, maxLength: 100 })`は`"ja"`で始まる文字列も生成する可能性があり、その場合は日本語テキストが返されるため、テストが失敗します。

#### 対策：フィルターまたは条件付きアサーション

生成するデータをフィルターするか、条件に応じてアサーションを変更します。

```typescript
// ✅ 改善後のコード（フィルター版）
it('should handle edge cases', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 50, maxLength: 100 })
        .filter((s) => !s.startsWith('ja')), // "ja"で始まらないもののみ
      (lang) => {
        const result = getPaginationText(lang, 'prev')
        expect(result).toBe('Previous')
      }
    )
  )
})

// ✅ 改善後のコード（条件付きアサーション版）
it('should handle edge cases', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 50, maxLength: 100 }),
      (lang) => {
        const result = getPaginationText(lang, 'prev')
        if (lang.startsWith('ja')) {
          expect(result).toBe('前へ')
        } else {
          expect(result).toBe('Previous')
        }
      }
    )
  )
})
```

**設計原則**：
- **生成データの範囲を明確にする**: フィルターで制限するか、条件付きアサーションを使う
- **想定外の入力値を考慮する**: ランダム生成では予想外の値も生成される

### 8. HTMLタグ文字の混入

#### 問題の症状

プレーンテキストを生成するarbitraryが、`<`や`>`を含む文字列を生成していました。

```typescript
// ❌ 問題のあるコード
const plainText = fc.string({ minLength: 0, maxLength: 100 })

it('should preserve plain text without HTML tags', () => {
  fc.assert(
    fc.property(plainText, (text) => {
      const result = removeHtmlTags(text)
      expect(result).toBe(text) // textに"<tag>"が含まれると失敗
    })
  )
})
```

`plainText`が`"hello <tag> world"`のような文字列を生成すると、`removeHtmlTags`が`<tag>`を削除して`"hello  world"`を返すため、テストが失敗します。

#### 対策：HTMLタグ文字を除外する

`<`と`>`を含まない文字列のみを生成します。

```typescript
// ✅ 改善後のコード
const plainText = fc.string({ minLength: 0, maxLength: 100 })
  .filter((s) => !s.includes('<') && !s.includes('>'))

it('should preserve plain text without HTML tags', () => {
  fc.assert(
    fc.property(plainText, (text) => {
      const result = removeHtmlTags(text)
      expect(result).toBe(text) // textにHTMLタグ文字が含まれない
    })
  )
})
```

**設計原則**：
- **テストの意図に合ったデータを生成する**: プレーンテキストならHTMLタグ文字を除外
- **フィルターで制約を明確にする**: 何をテストしているかをarbitraryの定義で表現する

## PBT設計で意識すべき5つの原則

### 1. 効率的なarbitrary設計

**原則**: フィルターに頼らず、構造化されたarbitraryを使う

```typescript
// ❌ 非効率
fc.string().filter(s => s.startsWith('ja'))

// ✅ 効率的
fc.oneof(
  fc.constant('ja'),
  fc.tuple(fc.constant('ja'), fc.string({ minLength: 1 }))
    .map(([prefix, suffix]) => prefix + suffix)
)
```

**チェックリスト**:
- [ ] フィルターのマッチ確率は10%以上か？
- [ ] `fc.constantFrom`で実際の値を列挙できるか？
- [ ] `fc.tuple`で構造化できるか？

### 2. 型安全性の確保

**原則**: 型アサーションを避け、関数の型シグネチャを尊重する

```typescript
// ❌ 危険
const result = func(input)
const result2 = func(result as string)

// ✅ 安全
const result = func(input)
const result2 = func(result)
```

**チェックリスト**:
- [ ] `as`を使っていないか？
- [ ] 関数の戻り値の型を確認したか？
- [ ] `null`や`undefined`の可能性を考慮したか？

### 3. 有効なテストデータの生成

**原則**: ドメインに適したarbitraryを使い、無効なデータを除外する

```typescript
// ❌ 無効なデータが混入
fc.string({ minLength: 1 }) // 日付として無効な文字列も生成

// ✅ 有効なデータのみ
fc.date().map(d => formatDate(d)) // 有効な日付を生成してから文字列に変換
```

**チェックリスト**:
- [ ] 生成されるデータはすべて有効か？
- [ ] ドメイン固有のarbitrary（`fc.date()`, `fc.webUrl()`など）を使えるか？
- [ ] 無効なデータはフィルターで除外しているか？

### 4. タイムゾーンとロケールの考慮

**原則**: 日付や文字列フォーマット関数のタイムゾーン/ロケール設定を確認する

```typescript
// ❌ タイムゾーン不一致
const year = date.getFullYear() // ローカルタイムゾーン
// 関数はUTCを使用

// ✅ タイムゾーン一致
const year = format === 'month-year'
  ? date.getUTCFullYear() // UTC
  : date.getFullYear() // ローカル
```

**チェックリスト**:
- [ ] 関数が使用するタイムゾーンを確認したか？
- [ ] テストデータと期待値のタイムゾーンは一致しているか？
- [ ] 年境界付近でテストがフレーキーにならないか？

### 5. エッジケースの網羅

**原則**: 境界値、特殊文字、大文字小文字など、様々なエッジケースをカバーする

```typescript
// ✅ エッジケースを網羅
describe('boundary value tests', () => {
  it('handles empty string', () => { /* ... */ })
  it('handles single character', () => { /* ... */ })
  it('handles long strings', () => { /* ... */ })
})

describe('case sensitivity', () => {
  it('handles uppercase', () => { /* ... */ })
  it('handles mixed case', () => { /* ... */ })
})
```

**チェックリスト**:
- [ ] 空文字列をテストしているか？
- [ ] 非常に長い文字列をテストしているか？
- [ ] 大文字小文字のバリエーションをテストしているか？
- [ ] 特殊文字を含むケースをテストしているか？

## 実践的なワークフロー

### ステップ1: プロパティを定義する

関数が満たすべき性質を明確にします。

```typescript
// 例: 日付フォーマット関数
// プロパティ1: 出力は常に非空文字列
// プロパティ2: 出力には年が含まれる
// プロパティ3: 同じ入力に対して同じ出力を返す（冪等性）
```

### ステップ2: 効率的なarbitraryを設計する

フィルターに頼らず、構造化されたarbitraryを作成します。

```typescript
// 実際に使われる値 → fc.constantFrom
// 構造化されたデータ → fc.tuple
// 複数の戦略 → fc.oneof
```

### ステップ3: テストを実行して問題を発見する

`fast-check`が反例を見つけたら、原因を分析します。

```typescript
// fast-checkが反例を報告
// Counterexample: ["ja      en  "]
// 
// 原因: "ja"で始まるが"en"も含む文字列
// 実装: /en/が先にマッチする
// 対策: フィルターを追加して"en"を含まないようにする
```

### ステップ4: 反復的に改善する

問題が見つかったら、arbitraryやアサーションを改善します。

## まとめ

プロパティベーステストは強力なテスト手法ですが、適切に設計しないと以下の問題が発生します：

1. **非効率的なarbitrary** → タイムアウト
2. **型安全性の無視** → 実行時エラーのリスク
3. **無効なテストデータ** → 意味のないテスト
4. **タイムゾーンの不一致** → フレーキーテスト
5. **エッジケースの見落とし** → バグの見逃し

これらの問題を防ぐため、以下の原則を意識してください：

- ✅ **効率的なarbitrary設計**: フィルターより構造化
- ✅ **型安全性の確保**: 型アサーションを避ける
- ✅ **有効なデータ生成**: ドメインに適したarbitrary
- ✅ **タイムゾーン/ロケールの考慮**: 設定を確認
- ✅ **エッジケースの網羅**: 境界値、特殊文字、大文字小文字

プロパティベーステストは、適切に設計すれば、従来のテストでは発見できないバグを見つける強力なツールです。この記事が、皆さんのPBT実装の参考になれば幸いです。

## 参考資料

- [fast-check公式ドキュメント](https://fast-check.dev/)
- [Property-Based Testing with fast-check (GitHub)](https://github.com/dubzzz/fast-check)
- [Property-Based Testing Patterns](https://fsharpforfunandprofit.com/posts/property-based-testing-2/)
