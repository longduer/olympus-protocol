pragma solidity 0.4.24;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./interfaces/ComponentInterface.sol";
import "./interfaces/ComponentListInterface.sol";
import "./libs/Converter.sol";


contract ComponentList is ComponentListInterface, Ownable {

    mapping(string => mapping(string => address)) private components;
    mapping(string => string[]) private componentVersions;

    function setComponent(string _name, address _componentAddress) public onlyOwner returns (bool) {
        ComponentInterface c = ComponentInterface(_componentAddress);
        components[_name][c.version()] = _componentAddress;
        bool included = false;
        uint indexToRemove = 0;
        // Remove the duplicate versions form the version arrays
        for (uint i = 0; i < componentVersions[_name].length; i++) {
            if (keccak256(abi.encodePacked(componentVersions[_name][i])) == keccak256(abi.encodePacked(c.version()))) {
                included = true;
                indexToRemove = i;
                break;
            }
        }
        if (included) {
            remove(_name, indexToRemove);
        }

        componentVersions[_name].push(c.version());

        emit ComponentUpdated(_name, c.version(), _componentAddress);

        return true;
    }

    function getComponent(string _name, string _version) public view returns (address) {
        return components[_name][_version];
    }

    function getLatestComponent(string _name) public view returns(address) {
        return components[_name][componentVersions[_name][componentVersions[_name].length - 1]];
    }

    function getLatestComponents(bytes32[] _names) public view returns(address[]) {
        address[] memory addresses = new address[](_names.length);
        string memory name;
        for (uint i = 0; i < _names.length; i++) {
            name = Converter.bytes32ToString(_names[i]);
            addresses[i] = components[name][componentVersions[name][componentVersions[name].length - 1]];
        }
        return addresses;
    }    

    function getComponentVersions(string _name) public view returns (bytes32[] results) {
        results = new bytes32[](componentVersions[_name].length);
        for (uint i = 0; i < componentVersions[_name].length; i++) {
            results[i] = Converter.stringToBytes32(componentVersions[_name][i]);
        }

        return results;
    }

    function remove(string _name, uint _index) private returns(string[]) {
        string[] storage array = componentVersions[_name];
        if (_index >= array.length) return;

        for (uint i = _index; i < array.length-1; i++) {
            array[i] = array[i+1];
        }
        array.length--;
        return array;
    }
}
