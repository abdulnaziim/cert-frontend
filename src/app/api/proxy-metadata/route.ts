import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Check for mock IPFS usage (bafymock...)
    if (url.includes("bafymock")) {
        console.log("Serving mock metadata for:", url);
        return NextResponse.json({
            name: "Test Certificate (Mock)",
            description: "This is a mock certificate for testing purposes. Real metadata could not be fetched for this mock CID (" + url.split('/').pop() + ").",
            recipient_name: "John Doe",
            recipient_email: "john.doe@example.com",
            issued_at: new Date().toISOString(),
            certificate_type: "completion",
            version: "1.0",
            image: "https://placehold.co/600x400/png?text=Certificate+NFT+Preview",
            external_url: "",
            properties: {
                files: []
            }
        });
    }

    try {
        // Convert ipfs:// to gateway URL if needed
        const targetUrl = url.startsWith("ipfs://")
            ? url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
            : url;

        const response = await fetch(targetUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch IPFS data: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json(
            { error: "Failed to fetch metadata" },
            { status: 500 }
        );
    }
}
