import { FastifyPluginAsync, HTTPMethods } from "fastify";

interface Stats {
  mean: number;
  mode: number;
  median: number;
  max: number;
  min: number;
  sd: number;
}

declare module 'fastify' {
  interface FastifyInstance {
    stats(): Partial<Record<HTTPMethods, Record<string, Stats>>>;
    measurements(): Partial<Record<HTTPMethods, Record<string, Array<number>>>>;
  }
}

interface FastifyRoutesStatsOptions {
  /**
   * @default 30000
   */
  printInterval?: number;
}

declare const fastifyRoutesStats: FastifyPluginAsync<FastifyRoutesStatsOptions>
export default fastifyRoutesStats
