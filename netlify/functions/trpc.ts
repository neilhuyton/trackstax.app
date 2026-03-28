exports.handler = async (event, context) => {
  console.log("All env vars:", Object.keys(process.env));
  console.log("My custom var:", process.env.DATABASE_URL);  // replace with your var name

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Check the function logs in Netlify dashboard",
      hasMyVar: !!process.env.DATABASE_URL
    })
  };
};