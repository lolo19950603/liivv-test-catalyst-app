type CustomCatalystSkeletonProps = {
  className?: string;
  message: string;
};

export function CustomCatalystSkeleton({
  className,
  message,
}: CustomCatalystSkeletonProps) {
  return (
    <div
      className={className}
      style={{
        border: '1px dashed #9ca3af',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        color: '#111827',
        fontSize: '14px',
        lineHeight: '20px',
      }}
    >
      {message}
    </div>
  );
}
