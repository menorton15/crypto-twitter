// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract CryptoTwitter is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    event Mint(uint256 indexed tokenId);

    struct Post {
        string id;
        uint256 createdAt;
        string content;
        string authorID;
        string parentID;
    }

    mapping(uint256 => Post) private _tokenData;
    mapping(string => uint256) private _tokenIdByDataId;

    constructor() ERC721("CryptoTwitter", "CTWTR") {}

    function mintNFT(
        uint256 createdAt,
        string memory id,
        string memory content,
        string memory authorID,
        string memory parentID
    ) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);

        Post memory newPost = Post({
            id: id,
            createdAt: createdAt,
            content: content,
            authorID: authorID,
            parentID: parentID
        });

        _tokenData[newTokenId] = newPost;
        _tokenIdByDataId[newPost.id] = newTokenId;
        _setTokenURI(newTokenId, getTokenURI(newTokenId));
        emit Mint(newTokenId);

        return newTokenId;
    }

    function burn(uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId));
        _burn(tokenId);
        delete _tokenIdByDataId[_tokenData[tokenId].id];
        delete _tokenData[tokenId];
    }

    function getNFTData(
        uint256 tokenId
    )
        public
        view
        returns (
            string memory id,
            uint256 createdAt,
            string memory content,
            string memory authorID,
            string memory parentID
        )
    {
        require(_exists(tokenId), "Token does not exist");

        Post memory tokenData = _tokenData[tokenId];

        return (
            tokenData.id,
            tokenData.createdAt,
            tokenData.content,
            tokenData.authorID,
            tokenData.parentID
        );
    }

    function getDataByPostId(
        string memory dataId
    )
        public
        view
        returns (
            string memory id,
            uint256 createdAt,
            string memory content,
            string memory authorId,
            string memory parentId
        )
    {
        require(
            _tokenIdByDataId[dataId] != 0,
            "Token with data ID does not exist"
        );

        uint256 _tokenId = _tokenIdByDataId[dataId];
        Post memory tokenData = _tokenData[_tokenId];

        return (
            tokenData.id,
            tokenData.createdAt,
            tokenData.content,
            tokenData.authorID,
            tokenData.parentID
        );
    }

    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        Post memory post = _tokenData[tokenId];
        string memory parent = post.parentID;

        if (bytes(parent).length == 0) {
            parent = "none";
        }

        bytes memory dataURI = abi.encodePacked(
            "{",
            '"attributes": [{"display_type": "date", "trait_type": "Date", "value": ',
            Strings.toString(post.createdAt),
            '},{"trait_type": "Author","value": "',
            post.authorID,
            '"},{"trait_type": "Parent","value": "',
            parent,
            '"}],',
            '"description": "',
            post.content,
            '",',
            '"image": "',
            generateImage(tokenId),
            '",',
            '"name": "Post ',
            post.id,
            '"',
            "}"
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(dataURI)
                )
            );
    }

    function generateImage(
        uint256 tokenId
    ) public view returns (string memory) {
        Post memory post = _tokenData[tokenId];
        bytes memory svg = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">',
            '<rect width="100%" height="100%" fill="black"/>',
            '<foreignObject width="100%" height="100%" style="padding-left: 10%; padding-right: 10%;">',
            '<div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; text-align: center; word-wrap: anywhere; color: #ffffff; align-items: center; justify-content: center;">',
            post.content,
            "</div>",
            "</foreignObject>",
            "</svg>"
        );

        return
            string(
                abi.encodePacked(
                    "data:image/svg+xml;base64,",
                    Base64.encode(svg)
                )
            );
    }
}
