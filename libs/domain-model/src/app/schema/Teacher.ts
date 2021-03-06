import * as mongoose from 'mongoose'

export interface TeacherAttributes {
  _id: any
  name: string
  lessonsScheduleImage?: any
}

export interface Teacher extends TeacherAttributes, mongoose.Document {}

const schema = new mongoose.Schema({
  name: { type: String, index: true },
  lessonsScheduleImage: { type: mongoose.Schema.Types.Buffer },
}, {
  collection: 'Teacher',
  autoIndex: false,
  timestamps: true,
})

export const TeacherModel = mongoose.model<Teacher>('TeacherModel', schema)
