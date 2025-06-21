const MaterialService = require('./material.service.js');

// Helper to handle service call errors
const handleServiceError = (res, error) => {
    console.error('Material Service Error:', error.message || error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'An unexpected server error occurred.';
    res.status(statusCode).json({ message });
};

exports.getMaterialById = async (req, res) => {
  try {
    const material = await MaterialService.getMaterialById(req.params.id);
    res.status(200).json(material);
  } catch (error) {
    handleServiceError(res, error);
  }
};

exports.completeMaterial = async (req, res) => {
  try {
    const result = await MaterialService.completeMaterialForUser(req.user._id, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(res, error);
  }
};

exports.createMaterial = async (req, res) => {
    try {
        const material = await MaterialService.createNewMaterial(req.body, req.user._id);
        res.status(201).json(material);
    } catch (error) {
        handleServiceError(res, error);
    }
};

exports.updateMaterial = async (req, res) => {
    try {
        const material = await MaterialService.updateExistingMaterial(req.params.id, req.body);
        res.status(200).json(material);
    } catch (error) {
        handleServiceError(res, error);
    }
};

exports.deleteMaterial = async (req, res) => {
    try {
        const result = await MaterialService.deleteExistingMaterial(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
};

exports.getAllMaterials = async (req, res) => {
    try {
        const result = await MaterialService.getAllMaterials(req.query);
        res.status(200).json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
};
