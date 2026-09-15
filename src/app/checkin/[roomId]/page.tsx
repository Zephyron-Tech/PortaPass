import CheckinFlow from "./CheckinFlow";

export default async function CheckinPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { roomId } = await params;
  const { token } = await searchParams;

  return <CheckinFlow roomId={roomId} token={token ?? ""} />;
}
