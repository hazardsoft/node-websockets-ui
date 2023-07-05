import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));

const { NODE_ENV = "production" } = process.env;
const isDev = NODE_ENV === "development";

export default {
    mode: isDev ? "development" : "production",
    devtool: isDev ? "source-map" : false,
    entry: "./src/index.ts",
    target: "node",
    experiments: {
        outputModule: true,
    },
    externalsPresets: { node: true },
    output: {
        path: resolve(__dirname, "./dist"),
        filename: "index.js",
        chunkFormat: "module",
        module: true,
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
        extensionAlias: {
            ".js": [".js", ".ts"],
        },
    },
};
