// import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server"
import { createSupabase } from "@/helpers/supabase";
const supabase = createSupabase(process.env.SECRET_KEY!);

async function handler(
  req:NextRequest,
  res:NextResponse
) {

  let body = {col:'',row:'',value:''}
  try {
    await req.json().then( (res: any) => {
      console.log('res')
      console.log(res)
      body = res
    })
  } catch(err){
    return NextResponse.json(
      {  valid: false },
      {
        status: 404,
      }
    );
  }


  if (
    req.method !== "POST" ||
    typeof body.col === "undefined" ||
    typeof body.row === "undefined" ||
    typeof body.value === "undefined"
  ) {
    return NextResponse.json(
      {  valid: false },
      {
        status: 400,
      }
    );
  }

  // upsert query that basically adds the row, column, and value, but if it exists, it just updates it.
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        column: body.col,
        row: body.row,
        value: body.value,
      },
      {
        onConflict: "row,column",
      }
    )
    .select();

    console.log('data')
    console.log(data)
    console.log('error')
    console.log(error)

  return NextResponse.json(
    {  valid: true },
    {
      status: 200,
    }
  );
}



export { handler as GET, handler as POST }

