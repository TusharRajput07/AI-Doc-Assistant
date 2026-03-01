import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

const StructuredAnswer = ({ answer }) => {
  if (!answer) return null;

  return (
    <div
      className="prose prose-sm prose-invert max-w-none
      prose-headings:text-white prose-headings:font-semibold prose-headings:mb-2
      prose-p:text-gray-300 prose-p:leading-relaxed prose-p:my-2
      prose-strong:text-pink-300 prose-strong:font-semibold
      prose-code:text-pink-300 prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
      prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-xl
      prose-blockquote:border-l-pink-500 prose-blockquote:text-gray-400 prose-blockquote:pl-4
      prose-a:text-pink-400 prose-a:no-underline hover:prose-a:underline
      prose-li:text-gray-300 prose-li:my-0.5
      prose-ul:my-2 prose-ol:my-2
      prose-hr:border-gray-700"
    >
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{answer}</ReactMarkdown>
    </div>
  );
};

export default StructuredAnswer;
