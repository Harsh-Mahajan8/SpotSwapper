import { useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import {
  useSwappableSlots,
  useCreateSwapRequest,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, User, ArrowRightLeft } from "lucide-react";

export default function Marketplace() {
  const { data: swappableSlots, isLoading: slotsLoading, error: slotsError, refetch: refetchSlots } = useSwappableSlots();
  const { data: myEvents, isLoading: eventsLoading } = useEvents();
  const createSwapRequest = useCreateSwapRequest();

  const [selectedMySlot, setSelectedMySlot] = useState("");
  const [selectedTheirSlot, setSelectedTheirSlot] = useState("");
  const [error, setError] = useState("");

  const handleSwapRequest = async () => {
    if (!selectedMySlot || !selectedTheirSlot) {
      setError(
        "Please select both your slot and the slot you want to swap with"
      );
      return;
    }

    setError("");

    try {
      const result = await createSwapRequest.mutateAsync({
        mySlotId: selectedMySlot,
        theirSlotId: selectedTheirSlot,
      });
      console.log("Swap request created:", result);
      // Success - form will reset and data will refresh automatically via query invalidation
      setSelectedMySlot("");
      setSelectedTheirSlot("");
      setError("");
      alert("Swap request created successfully! Check the Requests page for updates.");
    } catch (err) {
      console.error("Swap request error:", err);
      const errorMessage = 
        err.response?.data?.error || 
        (err.response?.data?.errors && Array.isArray(err.response.data.errors) 
          ? err.response.data.errors.map(e => e.msg || e).join(", ")
          : err.response?.data?.errors) ||
        err.message ||
        "Failed to create swap request";
      setError(errorMessage);
    }
  };

  const mySwappableSlots =
    myEvents?.filter((e) => e.status === "SWAPPABLE") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold mb-6">
          Marketplace - Swappable Slots
        </h2>

        {slotsError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-red-600 text-sm">
                Error loading swappable slots: {slotsError.response?.data?.error || slotsError.message}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchSlots()}
                className="mt-2"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
        
        {slotsLoading || eventsLoading ? (
          <div className="text-center py-12 text-lg text-muted-foreground">
            Loading swappable slots...
          </div>
        ) : !slotsError && swappableSlots && swappableSlots.length > 0 ? (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Request a Swap</CardTitle>
                <CardDescription>
                  Select one of your swappable slots and a slot from the
                  marketplace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Your Swappable Slot
                    </label>
                    <Select
                      value={selectedMySlot}
                      onValueChange={setSelectedMySlot}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {mySwappableSlots.length > 0 ? (
                          mySwappableSlots.map((slot) => (
                            <SelectItem key={slot.id} value={slot.id}>
                              {slot.title} - {formatDateTime(slot.startTime)}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No swappable slots (mark a slot as swappable first)
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Their Slot (from marketplace)
                    </label>
                    <Select
                      value={selectedTheirSlot}
                      onValueChange={setSelectedTheirSlot}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select their slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {swappableSlots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.title} by {slot.user.name} -{" "}
                            {formatDateTime(slot.startTime)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleSwapRequest}
                  disabled={
                    !selectedMySlot ||
                    !selectedTheirSlot ||
                    createSwapRequest.isPending ||
                    mySwappableSlots.length === 0
                  }
                  className="w-full md:w-auto"
                >
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  {createSwapRequest.isPending
                    ? "Creating Request..."
                    : "Request Swap"}
                </Button>
              </CardContent>
            </Card>

            <div className="max-w-4xl mx-auto mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {swappableSlots.map((slot) => (
                  <Card
                    key={slot.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {slot.title}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <User className="h-4 w-4" />
                          {slot.user.name}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4" />
                          {formatDateTime(slot.startTime)} -{" "}
                          {formatDateTime(slot.endTime)}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        Swappable
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : swappableSlots?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No swappable slots available in the marketplace.
              </p>
              <p className="text-sm text-muted-foreground">
                Other users need to mark their slots as swappable for them to appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Unable to load swappable slots. Please refresh the page.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
