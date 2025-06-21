// Paths relative to src/
const Material = require('./material.model.js');
const UserProgress = require('./exams/userProgress.model.js');
const { awardXP } = require('./xp/xpUtils.js');
const { updateProgressForAllRelevantChallenges } = require('./challenges/challengeTracker.util.js');

class MaterialService {
    async getMaterialById(materialId) {
        const material = await Material.findById(materialId)
            .populate('examCategory', 'name')
            .populate('subject', 'name')
            .populate('chapter', 'name')
            .populate('topic', 'name')
            .populate('createdBy', 'username name')
            .lean(); // Use lean if no further modifications to the document object itself

        if (!material || !material.isPublic) { // Assuming isPublic or similar access control
            throw { statusCode: 404, message: 'Material not found or not accessible.' };
        }
        return material;
    }

    async completeMaterialForUser(userId, materialId) {
        const material = await Material.findById(materialId).lean();
        if (!material) {
            throw { statusCode: 404, message: "Material not found." };
        }

        // Update UserProgress
        // This assumes material.examCategory is populated or available to correctly scope UserProgress
        // For simplicity, if material is not tied to an exam category, we might skip UserProgress update
        // or have a general progress tracker. Current UserProgress is examCategory specific.
        let userProgressUpdated = false;
        if (material.examCategory) { // Only update UserProgress if material is part of an exam category
            const userProgress = await UserProgress.findOneAndUpdate(
                { user: userId, examCategory: material.examCategory },
                { $addToSet: { completedMaterials: { material: materialId, completedAt: new Date() } } },
                { upsert: true, new: true }
            ).lean();
            userProgressUpdated = !!userProgress;
        } else {
            // Handle materials not linked to an exam category - perhaps a general completed list on User?
            // For now, we only update progress if examCategory is present on material.
        }

        // Award XP
        const xpAwarded = material.xpReward || 20; // Use material's own xpReward or a default
        await awardXP(userId, xpAwarded, 'material_completed', materialId, { materialTitle: material.title });

        // Track challenge progress
        await updateProgressForAllRelevantChallenges(userId, 'complete_study_material', 1);

        return {
            message: `Material '${material.title}' marked as complete. +${xpAwarded} XP`,
            xpAwarded,
            userProgressUpdated
        };
    }

    async getAllMaterials({ examCategory, subject, chapter, topic, materialType, page = 1, limit = 10 }) {
        const filter = { isPublic: true };
        if (examCategory) filter.examCategory = examCategory;
        if (subject) filter.subject = subject;
        if (chapter) filter.chapter = chapter;
        if (topic) filter.topic = topic;
        if (materialType) filter.materialType = materialType;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const materials = await Material.find(filter)
            .populate('examCategory', 'name')
            .populate('subject', 'name')
            .populate('chapter', 'name')
            .populate('topic', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const totalMaterials = await Material.countDocuments(filter);

        return {
            materials,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalMaterials / parseInt(limit)),
            totalMaterials
        };
    }

    // Admin functions
    async createNewMaterial(materialData, createdByUserId) {
        const data = { ...materialData, createdBy: createdByUserId };
        return await Material.create(data);
    }

    async updateExistingMaterial(materialId, updateData) {
        const material = await Material.findByIdAndUpdate(materialId, updateData, { new: true, runValidators: true }).lean();
        if (!material) throw { statusCode: 404, message: "Material not found." };
        return material;
    }

    async deleteExistingMaterial(materialId) {
        const material = await Material.findByIdAndDelete(materialId);
        if (!material) throw { statusCode: 404, message: "Material not found." };
        // Optionally, remove from UserProgress.completedMaterials
        return { message: "Material deleted successfully." };
    }
}

module.exports = new MaterialService();
