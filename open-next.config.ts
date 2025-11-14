// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig, r2IncrementalCache } from "@opennextjs/cloudflare/config";

export default defineCloudflareConfig({
	// R2 incremental cache for ISR caching
	incrementalCache: r2IncrementalCache,
});

