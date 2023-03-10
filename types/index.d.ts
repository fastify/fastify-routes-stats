import { FastifyPluginAsync, HTTPMethods } from "fastify";

declare module 'fastify' {
  interface FastifyInstance {
    stats(): Partial<Record<HTTPMethods, Record<string, fastifyRoutesStats.Stats>>>;
    measurements(): Partial<Record<HTTPMethods, Record<string, Array<number>>>>;
  }
}

type FastifyRoutesStats = FastifyPluginAsync<fastifyRoutesStats.FastifyRoutesStatsOptions>

declare namespace fastifyRoutesStats {
  export interface Stats {
    mean: number;
    mode: number;
    median: number;
    max: number;
    min: number;
    sd: number;
  }
  
  export interface FastifyRoutesStatsOptions {
    /**
     * @default 30000
     */
    printInterval?: number;

    /**
     * @default 'performanceMarked'
     */
    decoratorName?: string
  }

  export const fastifyRoutesStats: FastifyRoutesStats
  export { fastifyRoutesStats as default }
}

declare function fastifyRoutesStats(...params: Parameters<FastifyRoutesStats>): ReturnType<FastifyRoutesStats>
export = fastifyRoutesStats
