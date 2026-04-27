import HomePage from "../page";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "";

const baseErrorWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  backgroundColor: "#0a0a0a",
  color: "#ffffff",
  textAlign: "center",
  padding: "24px",
};

function ErrorEventPage({ title, body, sub }) {
  return (
    <div style={baseErrorWrapperStyle}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: "#1a1a1a",
          border: "2px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8, color: "#ffffff" }}>{title}</h1>
      <p style={{ fontSize: 14, color: "#666666", maxWidth: 280, lineHeight: 1.6 }}>{body}</p>
      <p style={{ fontSize: 12, color: "#444444", marginTop: 32 }}>{sub}</p>
    </div>
  );
}

export async function generateMetadata({ params }) {
  await params;
  return {
    title: "Lucky Draw Event",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function BrandPage({ params }) {
  const resolvedParams = await params;
  const alias = resolvedParams?.brand;

  if (!alias || !ADMIN_URL) {
    return (
      <ErrorEventPage
        title="Sự kiện không tồn tại"
        body="Đường dẫn này không hợp lệ hoặc sự kiện đã kết thúc."
        sub="Vui lòng kiểm tra lại đường dẫn từ ban tổ chức."
      />
    );
  }

  let response;
  try {
    response = await fetch(`${ADMIN_URL}/api/brand-alias/${alias}`, { cache: "no-store" });
  } catch {
    return (
      <ErrorEventPage
        title="Sự kiện không tồn tại"
        body="Đường dẫn này không hợp lệ hoặc sự kiện đã kết thúc."
        sub="Vui lòng kiểm tra lại đường dẫn từ ban tổ chức."
      />
    );
  }

  if (!response.ok) {
    return (
      <ErrorEventPage
        title="Sự kiện không tồn tại"
        body="Đường dẫn này không hợp lệ hoặc sự kiện đã kết thúc."
        sub="Vui lòng kiểm tra lại đường dẫn từ ban tổ chức."
      />
    );
  }

  const data = await response.json();
  const brand = data.brand ?? data;
  if (brand?.eventDate) {
    const eventDate = new Date(brand.eventDate);
    if (!Number.isNaN(eventDate.getTime()) && eventDate < new Date()) {
      return (
        <ErrorEventPage
          title="Sự kiện đã kết thúc"
          body={`Cảm ơn bạn đã tham gia ${brand.eventName ?? brand.name}.`}
          sub="Hẹn gặp lại ở sự kiện tiếp theo!"
        />
      );
    }
  }

  return <HomePage />;
}
