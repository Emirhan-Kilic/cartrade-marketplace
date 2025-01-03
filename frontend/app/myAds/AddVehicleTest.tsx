import React, { useState } from "react";
import VehicleAddedModal from "./VehicleAddedModal";

interface VehicleForm {
  manufacturer: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: "new" | "used" | "certified pre-owned";
  city: string;
  state: string;
  description: string;
  vehicleType: "car" | "motorcycle" | "truck";
  numberOfDoors?: number;
  seatingCapacity?: number;
  transmission?: "manual" | "automatic" | "semi-automatic" | "CVT";
  engineCapacity?: number;
  bikeType?: "Cruiser" | "Sport" | "Touring" | "Naked" | "Adventure";
  cargoCapacity?: number;
  hasTowingPackage?: boolean;
}


interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicle: VehicleForm) => void;
}

interface VehicleData {
  vehicle_id: number;
  ad_id?: number;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [newVehicle, setNewVehicle] = useState<VehicleForm>({
    manufacturer: "",
    model: "",
    year: 2023,
    price: 0,
    mileage: 0,
    condition: "new",
    city: "",
    state: "",
    description: "",
    vehicleType: "car",
  });

  const [showModal, setShowModal] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const userId = Number(sessionStorage.getItem("userId"));

  const handleAddVehicle = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    const vehiclePayload = {
      manufacturer: newVehicle.manufacturer,
      model: newVehicle.model,
      year: newVehicle.year,
      price: newVehicle.price,
      mileage: newVehicle.mileage,
      condition: newVehicle.condition,
      city: newVehicle.city,
      state: newVehicle.state,
      description: newVehicle.description,
    };

    let specificPayload: any = null;
    if (newVehicle.vehicleType === "car") {
      specificPayload = {
        number_of_doors: newVehicle.numberOfDoors,
        seating_capacity: newVehicle.seatingCapacity,
        transmission: newVehicle.transmission,
      };
    } else if (newVehicle.vehicleType === "motorcycle") {
      specificPayload = {
        engine_capacity: newVehicle.engineCapacity,
        bike_type: newVehicle.bikeType,
      };
    } else if (newVehicle.vehicleType === "truck") {
      specificPayload = {
        cargo_capacity: newVehicle.cargoCapacity,
        has_towing_package: newVehicle.hasTowingPackage,
      };
    }

    const finalPayload: any = { vehicle: vehiclePayload };
    if (specificPayload) {
      finalPayload[newVehicle.vehicleType] = specificPayload;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/add_vehicle/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalPayload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add vehicle");
      }

      const vehicleResponseData = await response.json();
      console.log("Vehicle added successfully:", vehicleResponseData);

      setVehicleData(vehicleResponseData);
      onSubmit(vehicleResponseData);

      const adPayload = {
        associated_vehicle: vehicleResponseData.vehicle_id,
        owner: userId,
        is_premium: false,
        status: "Pending",
      };

      const adResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/add_ad/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(adPayload),
        }
      );

      if (!adResponse.ok) {
        const errorData = await adResponse.json();
        console.error("Ad creation error:", errorData);
        throw new Error("Failed to create ad");
      }

      const adData = await adResponse.json();
      console.log("Ad created successfully:", adData);

      setVehicleData((prevData: VehicleData | null) => {
        if (prevData) {
          return {
            ...prevData,
            ad_id: adData.ad_id,
          };
        }
        return prevData;
      });

      setShowModal(true);
    } catch (error) {
      console.error("Error in vehicle/ad creation:", error);
      alert("Error creating vehicle listing. Please try again.");
      setShowModal(false);
    }
  };

  const handleVehicleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as "car" | "motorcycle" | "truck";
    setNewVehicle({ ...newVehicle, vehicleType: newType });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-11/12 sm:w-96 p-6 sm:p-8 shadow-xl transform transition-all duration-300 ease-in-out scale-105 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Add New Vehicle
        </h3>

        <form onSubmit={handleAddVehicle} className="space-y-4">
          {/* General Fields */}
          <div>
            <label
              htmlFor="manufacturer"
              className="block text-sm font-medium text-gray-600"
            >
              Manufacturer
            </label>
            <input
              type="text"
              id="manufacturer"
              value={newVehicle.manufacturer}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, manufacturer: e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="model"
              className="block text-sm font-medium text-gray-600"
            >
              Model
            </label>
            <input
              type="text"
              id="model"
              value={newVehicle.model}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, model: e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-gray-600"
            >
              Year
            </label>
            <input
              type="number"
              id="year"
              value={newVehicle.year}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, year: +e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-600"
            >
              Price
            </label>
            <input
              type="number"
              id="price"
              value={newVehicle.price}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, price: +e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="mileage"
              className="block text-sm font-medium text-gray-600"
            >
              Mileage
            </label>
            <input
              type="number"
              id="mileage"
              value={newVehicle.mileage}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, mileage: +e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="condition"
              className="block text-sm font-medium text-gray-600"
            >
              Condition
            </label>
            <select
              id="condition"
              value={newVehicle.condition}
              onChange={(e) =>
                setNewVehicle({
                  ...newVehicle,
                  condition: e.target.value as
                    | "new"
                    | "used"
                    | "certified pre-owned",
                })
              }
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
            >
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="certified pre-owned">Certified Pre-Owned</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-600"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              value={newVehicle.city}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, city: e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-600"
            >
              State
            </label>
            <input
              type="text"
              id="state"
              value={newVehicle.state}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, state: e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-600"
            >
              Description
            </label>
            <textarea
              id="description"
              value={newVehicle.description}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, description: e.target.value })
              }
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          {/* Vehicle Type Selection */}
          <div>
            <label
              htmlFor="vehicleType"
              className="block text-sm font-medium text-gray-600"
            >
              Vehicle Type
            </label>
            <select
              id="vehicleType"
              value={newVehicle.vehicleType}
              onChange={handleVehicleTypeChange}
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
            >
              <option value="car">Car</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="truck">Truck</option>
            </select>
          </div>

          {/* Car-specific fields */}
          {newVehicle.vehicleType === "car" && (
            <>
              <div>
                <label
                  htmlFor="numberOfDoors"
                  className="block text-sm font-medium text-gray-600"
                >
                  Number of Doors
                </label>
                <input
                  type="number"
                  id="numberOfDoors"
                  value={newVehicle.numberOfDoors || 0}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      numberOfDoors: +e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="seatingCapacity"
                  className="block text-sm font-medium text-gray-600"
                >
                  Seating Capacity
                </label>
                <input
                  type="number"
                  id="seatingCapacity"
                  value={newVehicle.seatingCapacity || 0}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      seatingCapacity: +e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="transmission"
                  className="block text-sm font-medium text-gray-600"
                >
                  Transmission
                </label>
                <select
                  id="transmission"
                  value={newVehicle.transmission}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      transmission: e.target.value as
                        | "manual"
                        | "automatic"
                        | "semi-automatic"
                        | "CVT",
                    })
                  }
                  className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
                >
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="semi-automatic">Semi-Automatic</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>
            </>
          )}

          {/* Motorcycle-specific fields */}
          {newVehicle.vehicleType === "motorcycle" && (
            <>
              <div>
                <label
                  htmlFor="engineCapacity"
                  className="block text-sm font-medium text-gray-600"
                >
                  Engine Capacity (cc)
                </label>
                <input
                  type="number"
                  id="engineCapacity"
                  value={newVehicle.engineCapacity || 0}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      engineCapacity: +e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="bikeType"
                  className="block text-sm font-medium text-gray-600"
                >
                  Bike Type
                </label>
                <select
                  id="bikeType"
                  value={newVehicle.bikeType}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      bikeType: e.target.value as
                        | "Cruiser"
                        | "Sport"
                        | "Touring"
                        | "Naked"
                        | "Adventure",
                    })
                  }
                  className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
                >
                  <option value="Cruiser">Cruiser</option>
                  <option value="Sport">Sport</option>
                  <option value="Touring">Touring</option>
                  <option value="Naked">Naked</option>
                  <option value="Adventure">Adventure</option>
                </select>
              </div>
            </>
          )}

          {/* Truck-specific fields */}
          {newVehicle.vehicleType === "truck" && (
            <>
              <div>
                <label
                  htmlFor="cargoCapacity"
                  className="block text-sm font-medium text-gray-600"
                >
                  Cargo Capacity
                </label>
                <input
                  type="number"
                  id="cargoCapacity"
                  value={newVehicle.cargoCapacity || 0}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      cargoCapacity: +e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="hasTowingPackage"
                  className="block text-sm font-medium text-gray-600"
                >
                  Has Towing Package
                </label>
                <input
                  type="checkbox"
                  id="hasTowingPackage"
                  checked={newVehicle.hasTowingPackage || false}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      hasTowingPackage: e.target.checked,
                    })
                  }
                  className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
            </>
          )}

          <div className="mt-6">
            <button
              type="submit"
              className="w-full py-3 bg-blue-500 text-white rounded-md font-semibold shadow-md hover:bg-blue-600 transition"
            >
              Add Vehicle
            </button>
          </div>
        </form>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
      </div>

      {/* Popup Modal */}
      {showModal && vehicleData && userId && (
        <VehicleAddedModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            onClose();
          }}
          userId={userId}
          vehicleId={vehicleData.vehicle_id}
        />
      )}
    </div>
  );
};

export default AddVehicleModal;
