"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import dummyData from "./dummyData.json";
import { getApiUrl } from "@/utils/api";

// Updated Interfaces for dynamic data
interface RateData {
  weight: string;
  zone: string;
  rate: number;
  portfolio_discount: number;
  incentive_discount: number;
  total_discount: number;
  applied_discount_rate: number;
  pre_minimum: number;
  final_min: number;
  final_rate: number;
  is_min: boolean;
}

interface ServiceObject {
  service: string,
  discounts_datas: RateData[]
} // Dynamic service names

type CalculatedData = ServiceObject[]; // Array of dynamic service objects

export default function CalculatePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const initialWeeklyCharges = searchParams.get("weeklyCharges") || "";

  const [selectedService, setSelectedService] = useState<string>("");
  const [weeklyCharges, setWeeklyCharges] = useState(initialWeeklyCharges);
  const [loading, setLoading] = useState(false);
  const [calculatedData, setCalculatedData] = useState<CalculatedData | null>(
    null
  );
  const [services, setServices] = useState<string[]>([]);
  const [rateData, setRateData] = useState<RateData[]>([]);
  const [weights, setWeights] = useState<string[]>([]);
  const [zones, setZones] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState("discount");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form input states
  const [weeklyCharge, setWeeklyCharge] = useState("");
  const [weightRange, setWeightRange] = useState("");
  const weeklyChargeInt = parseInt(weeklyCharge) || 0;
  const weightRangeInt = parseInt(weightRange) || 0;
  const handleSubmit = async () => {
    try {
      // Convert input values to integers with fallback to 0 if invalid
      const weeklySpend = parseInt(weeklyCharge) || 0;
      const weightRangeWidth = parseInt(weightRange) || null;

      // Validate inputs
      if (weeklySpend <= 0) {
        alert("Please enter valid values for Weekly Charge and Weight Range");
        return;
      }

      console.log("Downloading Moyer's data:", {
        weekly_spend: weeklySpend,
        weight_range_width: weightRangeWidth,
      });

      // Construct API URL
      const apiUrl = getApiUrl(
        `/api/v1/contract/${params.contract_id}/discount_card/download`
      );

      // Create request options
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weekly_spend: weeklySpend,
          weight_range_width: weightRangeWidth,
        }),
      };

      // Make the API call
      const response = await fetch(apiUrl, requestOptions);

      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to download the file");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link and trigger the download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "discounts.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Close the modal after successful download
      setIsModalOpen(false);

      // Reset form fields
      setWeeklyCharge("");
      setWeightRange("");
    } catch (error) {
      console.error("Error downloading Moyer's data:", error);

      // Handle the error properly based on its type
      let errorMessage = "An unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = error.message as string;
      }

      alert(`Error: ${errorMessage}`);
    }
  };
  useEffect(() => {
    if (initialWeeklyCharges) {
      handleCalculate();
    }
  }, [initialWeeklyCharges]);

  useEffect(() => {
    if (calculatedData) {
      console.log("Calculated Data:", calculatedData);

      // Extract service names
      const availableServices = calculatedData.map((obj) => obj.service);

      console.log("Available Services:", availableServices);
      setServices(availableServices);

      // Set initial service if available
      if (availableServices.length > 0 && !selectedService) {
        setSelectedService(availableServices[0]);
      }
    }
  }, [calculatedData, selectedService]);

  useEffect(() => {
    if (calculatedData && selectedService) {
      const serviceObject = calculatedData.find(
        (obj) => obj.service === selectedService
      );
      const rateDataArray = serviceObject?.discounts_datas || [];

      console.log("Rate Data for", selectedService, ":", rateDataArray);
      setRateData(rateDataArray);

      if (rateDataArray.length > 0) {
        const uniqueWeights = Array.from(
          new Set(rateDataArray.map((item) => item.weight))
        );
        const uniqueZones = Array.from(
          new Set(rateDataArray.map((item) => item.zone))
        ).sort();

        setWeights(uniqueWeights);
        setZones(uniqueZones);
      } else {
        setWeights([]);
        setZones([]);
      }
    }
  }, [calculatedData, selectedService]);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        getApiUrl(`/api/v1/contract/calculate/${params.contract_id}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            weekly_price: weeklyCharges,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Use dummyData for now, replace with API call later
      // setCalculatedData(dummyData as unknown as CalculatedData);
      setCalculatedData(data?.discount_card as unknown as CalculatedData);

      // Update URL with new weekly charges
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("weeklyCharges", weeklyCharges);
      router.push(`${window.location.pathname}?${newSearchParams.toString()}`);
    } catch (error) {
      console.error("Failed to calculate rates:", error);
      setCalculatedData(dummyData as unknown as CalculatedData);

      // toast({
      //   title: "Error",
      //   description: "Failed to calculate rates. Please try again.",
      //   variant: "destructive",
      // });
    } finally {
      setLoading(false);
    }
  };

  const getValueForWeightAndZone = (
    weight: string,
    zone: string,
    type: string
  ): string => {
    const data = rateData.find(
      (item) => item.weight === weight && item.zone === zone
    );
    if (!data) return "-";

    switch (type) {
      case "discount":
        return data.total_discount ? `${data.total_discount.toFixed(2)}%` : "-";
      case "preMin":
        return data.pre_minimum ? `$${Number(data.pre_minimum).toFixed(2)}` : "-";
      case "postMin":
        return data.final_min ? `$${data.final_min.toFixed(2)}` : "-";
      case "finalRate":
        return data.final_rate ? `$${data.final_rate.toFixed(2)}` : "-";
      default:
        return "-";
    }
  };

  const getCellStyle = (weight: string, zone: string): string => {
    const data = rateData.find(
      (item) => item.weight === weight && item.zone === zone
    );
    if (selectedTab === "finalRate" && data?.is_min) {
      return "bg-yellow-100 dark:bg-yellow-800 font-medium text-yellow-900 dark:text-yellow-100";
    }
    return "";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Rate Calculator
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <div className="w-full sm:w-auto flex items-center gap-2">
              <Label htmlFor="weeklyCharges" className="whitespace-nowrap">
                Weekly Charges:
              </Label>
              <Input
                id="weeklyCharges"
                type="number"
                value={weeklyCharges}
                onChange={(e) => setWeeklyCharges(e.target.value)}
                className="w-[150px]"
              />
            </div>
            <Button
              onClick={handleCalculate}
              className="w-full sm:w-auto"
              disabled={!weeklyCharges || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Calculate"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {calculatedData && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="flex items-center space-x-4">
                  <Label
                    htmlFor="service"
                    className="text-gray-700 dark:text-gray-300 font-medium"
                  >
                    Service:
                  </Label>
                  <Select
                    value={selectedService}
                    onValueChange={setSelectedService}
                  >
                    <SelectTrigger className="w-[220px] bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Select Service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 dark:border-gray-300 dark:text-gray-700 dark:hover:bg-gray-100"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Download Moyer&apos;s Data
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 dark:border-gray-300 dark:text-gray-700 dark:hover:bg-gray-100"
                    onClick={() => window.history.back()}
                  >
                    Back to Contract Viewer
                  </Button>
                </div>
              </div>

              {/* Modal for downloading Moyer's data */}
              {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg w-full max-w-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                      Download Moyer&apos;s Data
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="weeklyCharge"
                          className="block mb-2 text-gray-700 dark:text-gray-300"
                        >
                          Weekly Charge ($)
                        </Label>
                        <Input
                          id="weeklyCharge"
                          type="number"
                          step="1"
                          min="0"
                          value={weeklyCharge}
                          onChange={(e) => {
                            // Get the input value
                            const value = e.target.value;
                            // If empty, set to empty string, otherwise keep as string
                            setWeeklyCharge(value === "" ? "" : value);
                          }}
                          className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="weightRange"
                          className="block mb-2 text-gray-700 dark:text-gray-300"
                        >
                          Weight Range (width)
                        </Label>
                        <Input
                          id="weightRange"
                          type="number"
                          step="1"
                          min="0"
                          value={weightRange}
                          onChange={(e) => {
                            // Get the input value
                            const value = e.target.value;
                            // If empty, set to empty string, otherwise keep as string
                            setWeightRange(value === "" ? "" : value);
                          }}
                          className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                        onClick={handleSubmit}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Tabs
                defaultValue="discount"
                className="w-full"
                onValueChange={setSelectedTab}
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="discount">Discount (in %)</TabsTrigger>
                  <TabsTrigger value="preMin">
                    Pre Adjustment Minimum
                  </TabsTrigger>
                  <TabsTrigger value="postMin">
                    Post Adjustment Minimum
                  </TabsTrigger>
                  <TabsTrigger value="finalRate">Final Rate</TabsTrigger>
                </TabsList>

                {["discount", "preMin", "postMin", "finalRate"].map(
                  (tabValue) => (
                    <TabsContent key={tabValue} value={tabValue}>
                      <ScrollArea className="h-[600px] w-full rounded-md border border-gray-200 dark:border-gray-700">
                        <div className="relative w-full overflow-x-auto">
                          <table className="w-max border-collapse text-sm">
                            <thead>
                              <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="border-b p-3 text-left font-semibold sticky left-0 z-20">
                                  Weight \ Zone
                                </th>
                                {zones.map((zone) => (
                                  <th
                                    key={zone}
                                    className="border-b p-3 text-center font-semibold min-w-[100px]"
                                  >
                                    {zone}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {weights.map((weight, index) => (
                                <tr
                                  key={weight}
                                  className={
                                    index % 2 === 0
                                      ? "bg-white dark:bg-gray-800"
                                      : "bg-gray-50 dark:bg-gray-750"
                                  }
                                >
                                  <td className="border-b p-3 font-medium sticky left-0 z-10">
                                    {weight === "Letter"
                                      ? "Letter"
                                      : `${weight} lbs`}
                                  </td>
                                  {zones.map((zone) => (
                                    <td
                                      key={`${weight}-${zone}`}
                                      className={`border-b p-3 text-center ${getCellStyle(
                                        weight,
                                        zone
                                      )}`}
                                    >
                                      {getValueForWeightAndZone(
                                        weight,
                                        zone,
                                        tabValue
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  )
                )}
              </Tabs>
            </>
          )}
          {!calculatedData && !loading && (
            <div className="text-center py-8 text-gray-500">
              Enter weekly charges and click Calculate to view rates
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
