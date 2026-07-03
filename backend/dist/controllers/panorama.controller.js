"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyPanoramas = getPropertyPanoramas;
exports.createPanorama = createPanorama;
exports.updatePanorama = updatePanorama;
exports.deletePanorama = deletePanorama;
exports.replacePanoramaImage = replacePanoramaImage;
const panoramaService = __importStar(require("../services/panorama.service"));
const cloudinary_service_1 = require("../services/cloudinary.service");
const panorama_validator_1 = require("../utils/panorama-validator");
const panorama_service_1 = require("../services/panorama.service");
async function getPropertyPanoramas(req, res) {
    const panoramas = await panoramaService.getPropertyPanoramas(String(req.params.propertyId));
    res.json(panoramas);
}
async function createPanorama(req, res) {
    if (!req.file) {
        return res.status(400).json({
            message: "Panorama image is required"
        });
    }
    await (0, panorama_validator_1.validatePanorama)(req.file);
    const uploaded = await (0, cloudinary_service_1.uploadPanorama)(req.file);
    const panorama = await panoramaService.createPanorama(String(req.params.propertyId), {
        title: req.body.title,
        imageUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        sortOrder: Number(req.body.sortOrder ?? 0)
    });
    res.status(201).json(panorama);
}
async function updatePanorama(req, res) {
    const panorama = await panoramaService.updatePanorama(String(req.params.id), req.body);
    res.json(panorama);
}
async function deletePanorama(req, res) {
    await panoramaService.deletePanorama(String(req.params.id));
    res.status(204).send();
}
async function replacePanoramaImage(req, res) {
    if (!req.file) {
        return res.status(400).json({
            message: "Image is required"
        });
    }
    await (0, panorama_validator_1.validatePanorama)(req.file);
    const uploaded = await (0, cloudinary_service_1.uploadPanorama)(req.file);
    const panorama = await (0, panorama_service_1.replacePanoramaImage)(String(req.params.id), uploaded.secure_url, uploaded.public_id);
    res.json(panorama);
}
