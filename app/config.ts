interface Config {
  deepseekApiKey: string;
}

export const config: Config = {
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || 'sk-60dc0692c9e24b998d93fa50ee156b60'
};
