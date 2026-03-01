const config = {
    "*.{ts,tsx,js,jsx,mjs}": ["eslint --fix --max-warnings=0", "prettier --write"],
    "*.{css,md,mdx,json}": ["prettier --write"],
};

export default config;
