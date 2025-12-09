// default open-next.config.ts file created by @opennextjs/cloudflare
<<<<<<< HEAD
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

export default defineCloudflareConfig({
	// R2 incremental cache for ISR caching
	incrementalCache: r2IncrementalCache,
	// Durable Objects queue for ISR background revalidation
	queue: doQueue,
});

=======
import { defineCloudflareConfig } from '@opennextjs/cloudflare/config'

export default defineCloudflareConfig({
  // R2 incremental cache is optional - only needed for ISR caching
  // incrementalCache: r2IncrementalCache,
})
>>>>>>> origin/main
