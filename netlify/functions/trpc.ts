console.log("=== BRAND NEW FORCE REBUILD - March 28 ===");
export default async function (req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const allEnv = Object.keys(process.env).sort();

  return new Response(
    JSON.stringify({
      total: allEnv.length,
      envVars: allEnv,
      timestamp: new Date().toISOString()
    }, null, 2),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}