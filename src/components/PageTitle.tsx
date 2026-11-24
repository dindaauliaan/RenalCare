export function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="page-intro">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}
