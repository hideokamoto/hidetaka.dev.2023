import { getRuntime } from "@astrojs/cloudflare/runtime";
import { createClient } from "microcms-js-sdk";

/**
 * @see https://discord.com/channels/1074874430485958716/1075435519300870244/1100981542660079646
 */
export const createCFMicroCMSClient = (request: Request) => {
    console.log(JSON.stringify(request))
    const runtime = getRuntime(request)
    console.log(JSON.stringify(runtime))
    if (!runtime) {
        /**
         * For the local env
         */
        return createClient({
            serviceDomain: 'hidetaka',
            apiKey: import.meta.env.MICROCMS_API_KEY as string,
        })
    }
    return createClient({
        serviceDomain: 'hidetaka',
        apiKey: (runtime.env as any).MICROCMS_API_KEY,
    })
}