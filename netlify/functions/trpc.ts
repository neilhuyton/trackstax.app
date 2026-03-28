exports.handler = async () => {
  console.log("All env vars:", Object.keys(process.env));

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Check the function logs in Netlify dashboard",
      hasMyVar: !!process.env.MY_API_KEY,
    }),
  };
};
