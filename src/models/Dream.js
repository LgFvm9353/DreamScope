import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

const Dream = sequelize.define('Dream', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  emotion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  analysisStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'skipped'),
    defaultValue: 'pending',
  },
  analysisResult: {
    type: DataTypes.JSON,
    defaultValue: null,
  },
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

// 建立关联关系
Dream.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Dream, { foreignKey: 'userId' });

export default Dream;