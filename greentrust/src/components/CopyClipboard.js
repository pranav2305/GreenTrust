export const CopyClipboard = ({ content, setSnackbarInfo }) => {
  return (
    <div className="flex flex-row gap-x-2 mb-2">
      <p className="text-darkGray text-base font-bold">
        {content.slice(0, 5) + "..." + content.slice(-5)}
      </p>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 shadow-slate-700 active:translate-y-1 hover:cursor-pointer"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        onClick={() => {
          navigator.clipboard.writeText(content);
          setSnackbarInfo({ message: "Copied to clipboard", variant: "success", open: true });
        }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
        />
      </svg>
    </div>
  );
};
