// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TerraBlock {
    struct LandParcel {
        uint256 id;
        string location;
        uint256 area; // in square meters
        address owner;
        bool exists;
    }

    mapping(uint256 => LandParcel) public landParcels;
    uint256 public nextParcelId;

    event LandRegistered(uint256 indexed parcelId, address indexed owner, string location, uint256 area);
    event OwnershipTransferred(uint256 indexed parcelId, address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner(uint256 parcelId) {
        require(landParcels[parcelId].owner == msg.sender, "Not the owner");
        _;
    }

    function registerLand(string memory location, uint256 area) public {
        uint256 parcelId = nextParcelId++;
        landParcels[parcelId] = LandParcel(parcelId, location, area, msg.sender, true);
        emit LandRegistered(parcelId, msg.sender, location, area);
    }

    function transferOwnership(uint256 parcelId, address newOwner) public onlyOwner(parcelId) {
        require(newOwner != address(0), "Invalid new owner");
        address oldOwner = landParcels[parcelId].owner;
        landParcels[parcelId].owner = newOwner;
        emit OwnershipTransferred(parcelId, oldOwner, newOwner);
    }

    function getLandDetails(uint256 parcelId) public view returns (LandParcel memory) {
        require(landParcels[parcelId].exists, "Land parcel does not exist");
        return landParcels[parcelId];
    }
}
