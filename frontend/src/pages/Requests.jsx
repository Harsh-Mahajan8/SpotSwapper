import {
  useIncomingRequests,
  useOutgoingRequests,
  useRespondToSwapRequest,
} from "@/hooks/useSwapRequests";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, Check, X, ArrowRight } from "lucide-react";

function TabsWrapper() {
  return (
    <Tabs defaultValue="incoming" className="space-y-4">
      <TabsList>
        <TabsTrigger value="incoming">Incoming Requests</TabsTrigger>
        <TabsTrigger value="outgoing">Outgoing Requests</TabsTrigger>
      </TabsList>
      <TabsContent value="incoming">
        <IncomingRequests />
      </TabsContent>
      <TabsContent value="outgoing">
        <OutgoingRequests />
      </TabsContent>
    </Tabs>
  );
}

function IncomingRequests() {
  const { data: requests, isLoading, error: requestsError } = useIncomingRequests();
  const respondToRequest = useRespondToSwapRequest();

  const handleRespond = async (requestId, action) => {
    if (
      action === "accept" &&
      !confirm("Are you sure you want to accept this swap? This will exchange the slot ownership permanently.")
    ) {
      return;
    }

    try {
      await respondToRequest.mutateAsync({ id: requestId, action });
      // Success message - data will refresh automatically via query invalidation
      const message = action === "accept"
        ? "Swap accepted! The slots have been exchanged. Check your dashboard to see the new slot."
        : "Swap rejected. Both slots are now available again.";
      alert(message);
    } catch (err) {
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.errors?.map(e => e.msg || e).join(", ") ||
        "Failed to process request";
      alert(errorMessage);
    }
  };

  if (isLoading)
    return <div className="text-center py-12">Loading requests...</div>;

  if (requestsError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-600 text-sm">
            Error loading requests: {requestsError.response?.data?.error || requestsError.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = requests?.filter((r) => r.status === "PENDING") || [];

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No incoming swap requests.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pendingRequests.map((request) => (
        <Card key={request.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Swap Request</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <User className="h-4 w-4" />
                From: {request.requester.name}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-1 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">
                    {request.requesterSlot.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(request.requesterSlot.startTime)}
                  </p>
                </div>
              </div>
              <div className="text-center text-muted-foreground py-2">
                ↓ swaps with ↓
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-1 text-green-500" />
                <div>
                  <p className="text-sm font-medium">
                    {request.responderSlot.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(request.responderSlot.startTime)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleRespond(request.id, "accept")}
                disabled={respondToRequest.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                onClick={() => handleRespond(request.id, "reject")}
                disabled={respondToRequest.isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function OutgoingRequests() {
  const { data: requests, isLoading, error: requestsError } = useOutgoingRequests();

  if (isLoading)
    return <div className="text-center py-12">Loading requests...</div>;

  if (requestsError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-600 text-sm">
            Error loading requests: {requestsError.response?.data?.error || requestsError.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No outgoing swap requests.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {requests.map((request) => (
        <Card key={request.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Swap Request</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <User className="h-4 w-4" />
                To: {request.responder.name}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-1 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">
                    {request.requesterSlot.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(request.requesterSlot.startTime)}
                  </p>
                </div>
              </div>
              <div className="text-center text-muted-foreground py-2">
                ↓ swaps with ↓
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-1 text-green-500" />
                <div>
                  <p className="text-sm font-medium">
                    {request.responderSlot.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(request.responderSlot.startTime)}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  request.status === "ACCEPTED"
                    ? "bg-green-100 text-green-800"
                    : request.status === "REJECTED"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {request.status}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Requests() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Swap Requests</h2>
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
          <TabsWrapper />
        </div>
      </div>
    </div>
  );
}
