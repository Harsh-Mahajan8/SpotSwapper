import { useState } from "react";
import { useEvents, useCreateEvent, useUpdateEvent } from "@/hooks/useEvents";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Calendar, Clock } from "lucide-react";

export default function Dashboard({ showFormInitially = false }) {
  const { data: events, isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const [showForm, setShowForm] = useState(showFormInitially);
  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    endTime: "",
    status: "BUSY",
  });
  const [error, setError] = useState("");

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createEvent.mutateAsync({
        title: formData.title,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: formData.status,
      });
      setFormData({ title: "", startTime: "", endTime: "", status: "BUSY" });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create event");
    }
  };

  const handleToggleSwappable = async (eventId, currentStatus) => {
    const newStatus = currentStatus === "SWAPPABLE" ? "BUSY" : "SWAPPABLE";
    try {
      await updateEvent.mutateAsync({ id: eventId, status: newStatus });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update event");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">My Calendar</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6 shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Create New Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUSY">Busy</SelectItem>
                        <SelectItem value="SWAPPABLE">Swappable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createEvent.isPending}>
                    {createEvent.isPending ? "Creating..." : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-12">Loading events...</div>
        ) : events && events.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card
                key={event.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {event.title}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-4 w-4" />
                      {formatDateTime(event.startTime)} -{" "}
                      {formatDateTime(event.endTime)}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        event.status === "SWAPPABLE"
                          ? "bg-green-100 text-green-800"
                          : event.status === "SWAP_PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {event.status.replace("_", " ")}
                    </span>
                    {event.status !== "SWAP_PENDING" && (
                      <Button
                        variant={
                          event.status === "SWAPPABLE"
                            ? "destructive"
                            : "default"
                        }
                        size="sm"
                        onClick={() =>
                          handleToggleSwappable(event.id, event.status)
                        }
                        disabled={updateEvent.isPending}
                      >
                        {event.status === "SWAPPABLE"
                          ? "Mark Busy"
                          : "Mark Swappable"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No events yet. Create your first event!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
