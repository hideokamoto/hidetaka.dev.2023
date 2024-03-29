//import { getRuntime } from "@astrojs/cloudflare/runtime";
import { createClient } from "microcms-js-sdk";
import type { MicroCMSClient } from "./types";

/**
 * @see https://discord.com/channels/1074874430485958716/1075435519300870244/1100981542660079646
 */
export const createCFMicroCMSClient = (runtime: any):MicroCMSClient => {
    if (runtime && runtime.env) {
        const cfRuntimeAPIKEY = (runtime.env as any).MICROCMS_API_KEY as string
        if (cfRuntimeAPIKEY) {
            return createClient({
                serviceDomain: 'hidetaka',
                apiKey: cfRuntimeAPIKEY,
            })
        }
    }
    const viteEnvAPIKEY = import.meta.env.MICROCMS_API_KEY
    if (viteEnvAPIKEY) {
        return createClient({
            serviceDomain: 'hidetaka',
            apiKey: import.meta.env.MICROCMS_API_KEY as string,
        })
    }
    const envAPIKEY = (process.env as any).MICROCMS_API_KEY
    if (envAPIKEY) {
        return createClient({
            serviceDomain: 'hidetaka',
            apiKey: (process.env as any).MICROCMS_API_KEY as string,
        })
    }
    console.log({
        message: "Failed to load the microcms API keys"
    })
    return {
        async get(props) {
            if (props.contentId) {
                return {}
            }
            return {
                contents: []
            }
        }
    } as MicroCMSClient
}