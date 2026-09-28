import { changeLike } from "@/lib/like-api";
export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };
export async function PUT(request: Request, { params }: Params) {
    return changeLike(request, { kind: "comment", id: (await params).id }, true);
}
export async function DELETE(request: Request, { params }: Params) {
    return changeLike(request, { kind: "comment", id: (await params).id }, false);
}
