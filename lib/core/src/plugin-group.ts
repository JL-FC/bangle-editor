import type { Plugin } from '@jl-fc/pm';

interface DeepPluginArray extends Array<Plugin | DeepPluginArray> {}

export class PluginGroup {
  constructor(public name: string, public plugins: DeepPluginArray) {}
}
