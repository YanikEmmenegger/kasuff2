// src/models/Visitor.ts
import mongoose, {Document, Schema} from 'mongoose';

export interface IVisitor extends Document {
    ipAddress: string;
    userAgent: string;
    referer: string;
    acceptLanguage: string;
    visitTime: Date;
}

const VisitorSchema: Schema = new Schema({
    ipAddress: {type: String, required: true},
    userAgent: {type: String, default: 'Unknown'},
    referer: {type: String, default: 'Direct'},
    acceptLanguage: {type: String, default: 'Unknown'},
    visitTime: {type: Date, default: Date.now}
});

export default mongoose.model<IVisitor>('Visitor', VisitorSchema);
