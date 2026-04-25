import { NextRequest, NextResponse } from "next/server"

const ENDPOINT = process.env.TRANSLATOR_ENDPOINT
const API_KEY = process.env.TRANSLATOR_API_KEY
const REGION = process.env.TRANSLATOR_REGION

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      text?: string
      texts?: string[]
      target?: string
      from?: string
    }

    const singleText = body.text?.trim()
    const texts = Array.isArray(body.texts)
      ? body.texts.map((item) => item?.trim()).filter((item): item is string => Boolean(item))
      : []
    const target = body.target?.trim()
    const from = body.from?.trim()

    if ((!singleText && texts.length === 0) || !target) {
      return NextResponse.json(
        { error: "A text payload and target are required." },
        { status: 400 }
      )
    }

    const inputTexts = texts.length > 0 ? texts : [singleText as string]

    if (target === "en") {
      return NextResponse.json({
        translation: inputTexts[0],
        translations: inputTexts,
      })
    }

    if (!ENDPOINT || !API_KEY || !REGION) {
      return NextResponse.json(
        { error: "Translator environment variables are missing." },
        { status: 500 }
      )
    }

    const url = new URL("/translate", ENDPOINT)
    url.searchParams.set("api-version", "3.0")
    url.searchParams.append("to", target)

    if (from) {
      url.searchParams.set("from", from)
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": API_KEY,
        "Ocp-Apim-Subscription-Region": REGION,
        "X-ClientTraceId": crypto.randomUUID(),
      },
      body: JSON.stringify(inputTexts.map((text) => ({ text }))),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: errorText || "Azure translation request failed." },
        { status: response.status }
      )
    }

    const payload = (await response.json()) as Array<{
      translations?: Array<{ text?: string }>
    }>

    const translations = payload.map((item, index) => {
      return item?.translations?.[0]?.text ?? inputTexts[index]
    })

    return NextResponse.json({
      translation: translations[0] ?? inputTexts[0],
      translations,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected translation error.",
      },
      { status: 500 }
    )
  }
}
