import React, { useState, useEffect } from "react";

const TerraBlock = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [landParcels, setLandParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE_URL = "http://localhost:4000";

  const [newLandData, setNewLandData] = useState({
    location: "",
    area: "",
    ownerAddress: "",
  });

  const [transferData, setTransferData] = useState({
    parcelId: "",
    newOwner: "",
  });

  const fetchLandParcels = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/land`);
      if (!response.ok) throw new Error("Failed to fetch land parcels");
      const data = await response.json();
      setLandParcels(data);
    } catch (err) {
      setError("Failed to fetch land parcels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandParcels();
  }, []);

  const handleRegisterLand = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_BASE_URL}/land/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLandData),
      });
      if (!response.ok) throw new Error("Registration failed");
      const result = await response.json();
      setSuccess("Land registered successfully!");
      setNewLandData({ location: "", area: "", ownerAddress: "" });
      fetchLandParcels();
    } catch (err) {
      setError("Failed to register land");
    } finally {
      setLoading(false);
    }
  };

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_BASE_URL}/land/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transferData),
      });
      if (!response.ok) throw new Error("Transfer failed");
      setSuccess("Ownership transferred successfully!");
      setTransferData({ parcelId: "", newOwner: "" });
      fetchLandParcels();
    } catch (err) {
      setError("Failed to transfer ownership");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">TB</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                TerraBlock
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                <span className="text-blue-400">Network: </span>
                <span>Ethereum Mainnet</span>
              </div>
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="bg-gray-800 rounded-xl p-2 mb-8">
          <div className="flex space-x-1">
            {["dashboard", "register", "transfer", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                {tab
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </button>
            ))}
          </div>
        </nav>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <div className="flex items-center">
              <span className="text-red-400 mr-2">⚠️</span>
              <span className="text-red-200">{error}</span>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✅</span>
              <span className="text-green-200">{success}</span>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-gray-400 text-sm mb-2">
                  Total Land Parcels
                </h3>
                <p className="text-3xl font-bold text-white">
                  {landParcels.length}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-gray-400 text-sm mb-2">Registered</h3>
                <p className="text-3xl font-bold text-green-400">
                  {landParcels.filter((p) => p.status === "Registered").length}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-gray-400 text-sm mb-2">Pending</h3>
                <p className="text-3xl font-bold text-yellow-400">
                  {landParcels.filter((p) => p.status === "Pending").length}
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Land Parcels</h2>
            {landParcels.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No land parcels found. Register a new parcel to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {landParcels.map((parcel) => (
                  <div
                    key={parcel.id}
                    className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all duration-300"
                  >
                    <div className="h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20 relative">
                      <img
                        src={parcel.image}
                        alt="Parcel Image"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            parcel.status === "Registered"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {parcel.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{parcel.id}</h3>
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span className="text-white">{parcel.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Area:</span>
                          <span className="text-white">
                            {parcel.area} sq ft
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Owner:</span>
                          <span className="text-blue-400 font-mono text-xs">
                            {parcel.owner}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Registered:</span>
                          <span className="text-white">
                            {parcel.registrationDate}
                          </span>
                        </div>
                      </div>
                      <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all duration-200">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Register Land */}
        {activeTab === "register" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
              <h2 className="text-2xl font-bold mb-2">
                Register New Land Parcel
              </h2>
              <p className="text-gray-400 mb-6">
                Register a new land parcel on the blockchain
              </p>

              <form onSubmit={handleRegisterLand} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newLandData.location}
                    onChange={(e) =>
                      setNewLandData({
                        ...newLandData,
                        location: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter property address"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Area (sq ft)
                  </label>
                  <input
                    type="number"
                    value={newLandData.area}
                    onChange={(e) =>
                      setNewLandData({ ...newLandData, area: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter area in square feet"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Owner Wallet Address
                  </label>
                  <input
                    type="text"
                    value={newLandData.ownerAddress}
                    onChange={(e) =>
                      setNewLandData({
                        ...newLandData,
                        ownerAddress: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="0x..."
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Property Document
                  </label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer">
                    <div className="text-gray-400 mb-2">
                      Drag & drop or click to upload survey document
                    </div>
                    <button
                      type="button"
                      className="text-blue-400 hover:text-blue-300 font-medium"
                      disabled={loading}
                    >
                      Select file
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Processing...
                    </span>
                  ) : (
                    "Register on Blockchain"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Transfer Ownership */}
        {activeTab === "transfer" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
              <h2 className="text-2xl font-bold mb-2">
                Transfer Land Ownership
              </h2>
              <p className="text-gray-400 mb-6">
                Transfer ownership of a land parcel to another user
              </p>

              <form onSubmit={handleTransferOwnership} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Land Parcel
                  </label>
                  <select
                    value={transferData.parcelId}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        parcelId: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={loading}
                  >
                    <option value="">Select a land parcel</option>
                    {landParcels
                      .filter((p) => p.status === "Registered")
                      .map((parcel) => (
                        <option key={parcel.id} value={parcel.id}>
                          {parcel.id} - {parcel.location}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Owner Wallet Address
                  </label>
                  <input
                    type="text"
                    value={transferData.newOwner}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        newOwner: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="0x..."
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Processing...
                    </span>
                  ) : (
                    "Transfer Ownership"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Transaction History */}
        {activeTab === "history" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="grid grid-cols-4 gap-4 p-6 bg-gray-900 text-gray-400 text-sm font-medium">
                <div>Parcel ID</div>
                <div>Date</div>
                <div>Action</div>
                <div>By</div>
              </div>
              <div className="divide-y divide-gray-700">
                {landParcels.flatMap((parcel) =>
                  parcel.transactionHistory.map((transaction, index) => (
                    <div
                      key={`${parcel.id}-${index}`}
                      className="grid grid-cols-4 gap-4 p-6 hover:bg-gray-750 transition-colors duration-200"
                    >
                      <div className="text-blue-400 font-medium">
                        {parcel.id}
                      </div>
                      <div className="text-gray-300">{transaction.date}</div>
                      <div className="text-green-400">{transaction.action}</div>
                      <div className="text-gray-400 font-mono text-sm">
                        {transaction.by}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerraBlock;
