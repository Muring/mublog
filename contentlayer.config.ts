// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import remarkGfm from "remark-gfm";

export const Post = defineDocumentType(() => ({
    name: "Post",
    filePathPattern: `posts/**/*.mdx`,
    contentType: "mdx",
    fields: {
        title: { type: "string", required: true },
        date: { type: "date", required: true },
        description: { type: "string", required: false },
        tags: {
            type: "list",
            of: { type: "string" },
            required: false,
        },
    },
    computedFields: {
        slug: {
            type: "string",
            resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, ""),
        },
    },
}));

export default makeSource({
    contentDirPath: "src/contents/",
    documentTypes: [Post],
    mdx: {
        remarkPlugins: [remarkGfm],
    },
});
