"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInternVisitStatus = void 0;
const updateInternVisitStatus = async (req, res) => {
    try {
        const internId = req.intern.id;
        const visitId = req.params.id;
        const { otp, status, notes, } = req.body;
        const visit = await prisma.visit.findFirst({
            where: {
                id: visitId,
                assignedLeadId: internId,
            },
        });
        if (!visit) {
            return res.status(404).json({
                success: false,
                message: "Visit not found",
            });
        }
        if (visit.visitOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }
        const updated = await prisma.visit.update({
            where: {
                id: visit.id,
            },
            data: {
                leadStatus: status,
                visitVerified: true,
                notes: notes || null,
            },
        });
        return res.json({
            success: true,
            visit: updated,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updateInternVisitStatus = updateInternVisitStatus;
