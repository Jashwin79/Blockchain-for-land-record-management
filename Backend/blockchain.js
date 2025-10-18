const { ethers } = require("ethers");
require("dotenv").config();

// Initialize provider and wallet
const provider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_URL || "http://localhost:8545"
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// In-memory storage for demonstration (in production, use a database)
let landParcels = [
  {
    id: "LP-001",
    location: "123 Main St, Cityville",
    area: "1200",
    owner: "0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59",
    registrationDate: "2023-05-15",
    status: "Registered",
    transactionHistory: [
      { date: "2023-05-15", action: "Registered", by: "Government Office" },
      { date: "2022-11-20", action: "Surveyed", by: "City Survey Dept" },
    ],
  },
  {
    id: "LP-002",
    location: "456 Oak Ave, Townsville",
    area: "2400",
    owner: "0x8a2d45Bb7A1e5eD4a2bC9dE8F7A3e1D2f4C6e8F0",
    registrationDate: "2023-02-10",
    status: "Registered",
    transactionHistory: [
      { date: "2023-02-10", action: "Registered", by: "Government Office" },
      {
        date: "2021-08-15",
        action: "Previous Transfer",
        by: "0x3b1f29Cc6634C893292Ce8bB6239C002Ad8e6b59",
      },
    ],
  },
];

// Load contract ABI and address
const TerraBlockABI = [
  "function registerLand(string memory location, uint256 area) public",
  "function transferOwnership(uint256 parcelId, address newOwner) public",
  "function getLandDetails(uint256 parcelId) public view returns (uint256 id, string memory location, uint256 area, address owner, bool exists)",
  "event LandRegistered(uint256 indexed parcelId, address indexed owner, string location, uint256 area)",
  "event OwnershipTransferred(uint256 indexed parcelId, address indexed oldOwner, address indexed newOwner)",
];

const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, TerraBlockABI, wallet);

// Register new land parcel
async function registerLand(location, area, ownerAddress) {
  try {
    console.log(
      `Registering land: ${location}, ${area} sq ft, owner: ${ownerAddress}`
    );

    // Convert area to number
    const areaNumber = parseInt(area);

    // Send transaction to register land
    const tx = await contract.registerLand(location, areaNumber);
    console.log("Transaction sent:", tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.transactionHash);

    // Generate a new parcel ID
    const newParcelId = `LP-${String(landParcels.length + 1).padStart(3, "0")}`;

    // Add to our in-memory storage
    const newParcel = {
      id: newParcelId,
      location: location,
      area: area,
      owner: ownerAddress,
      registrationDate: new Date().toISOString().split("T")[0],
      status: "Registered",
      transactionHistory: [
        {
          date: new Date().toISOString().split("T")[0],
          action: "Registered",
          by: ownerAddress,
        },
      ],
    };

    landParcels.push(newParcel);

    return {
      txHash: receipt.transactionHash,
      parcel: newParcel,
    };
  } catch (error) {
    console.error("Error in registerLand:", error);
    throw new Error(`Blockchain registration failed: ${error.message}`);
  }
}

// Transfer land ownership
async function transferOwnership(parcelId, newOwner) {
  try {
    console.log(`Transferring parcel ${parcelId} to new owner: ${newOwner}`);

    // Extract numeric ID from format like "LP-001"
    const numericParcelId = parseInt(parcelId.split("-")[1]);

    const tx = await contract.transferOwnership(numericParcelId, newOwner);
    console.log("Transfer transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transfer transaction confirmed:", receipt.transactionHash);

    // Update our in-memory storage
    const parcelIndex = landParcels.findIndex((p) => p.id === parcelId);
    if (parcelIndex !== -1) {
      const oldOwner = landParcels[parcelIndex].owner;
      landParcels[parcelIndex].owner = newOwner;
      landParcels[parcelIndex].transactionHistory.push({
        date: new Date().toISOString().split("T")[0],
        action: "Ownership Transferred",
        by: oldOwner,
        to: newOwner,
      });
    }

    return {
      txHash: receipt.transactionHash,
      parcel: landParcels[parcelIndex],
    };
  } catch (error) {
    console.error("Error in transferOwnership:", error);
    throw new Error(`Ownership transfer failed: ${error.message}`);
  }
}

// Get all land parcels
function getAllLandParcels() {
  return landParcels;
}

// Get land details
async function getLandDetails(parcelId) {
  try {
    console.log(`Fetching details for parcel: ${parcelId}`);

    // Extract numeric ID
    const numericParcelId = parseInt(parcelId.split("-")[1]);

    const landDetails = await contract.getLandDetails(numericParcelId);

    return {
      id: parcelId,
      location: landDetails.location,
      area: landDetails.area.toString(),
      owner: landDetails.owner,
      exists: landDetails.exists,
    };
  } catch (error) {
    console.error("Error in getLandDetails:", error);
    throw new Error(`Failed to fetch land details: ${error.message}`);
  }
}

module.exports = {
  registerLand,
  transferOwnership,
  getAllLandParcels,
  getLandDetails,
};
