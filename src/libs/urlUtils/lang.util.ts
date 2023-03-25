export function getLanguageFromURL(pathname: string) {
    // ja,en,es
	//const langCodeMatch = pathname.match(/\/([a-z]{2}-?[a-z]{0,2})/);
    // ja-JP, en-US
    const langCodeMatch = pathname.match(/^\/(\w{2})-([\w-]{2,})/);
	return langCodeMatch ? langCodeMatch[1] : 'en';
}