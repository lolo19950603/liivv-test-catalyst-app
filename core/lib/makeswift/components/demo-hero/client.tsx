type DemoHeroProps = {
  className?: string;
  eyebrow: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt: string;
};

export function DemoHero({
  className,
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
}: DemoHeroProps) {
  return (
    <section
      className={className}
      style={{
        border: '1px solid hsl(var(--contrast-100))',
        borderRadius: '8px',
        background: 'hsl(var(--background))',
        padding: '32px',
      }}
    >
      {imageSrc ? (
        <img
          alt={imageAlt}
          src={imageSrc}
          style={{
            width: '100%',
            maxHeight: '280px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        />
      ) : null}
      <p
        style={{
          marginBottom: '8px',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'hsl(var(--contrast-500))',
        }}
      >
        {eyebrow}
      </p>
      <h1 style={{ marginBottom: '12px', fontSize: '36px', fontWeight: 600, lineHeight: 1.1 }}>{title}</h1>
      <p style={{ color: 'hsl(var(--contrast-500))', fontSize: '16px', lineHeight: 1.5 }}>{description}</p>
    </section>
  );
}
