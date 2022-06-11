import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { User } from '../models/index.js'

export const register = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email })
    if (existingUser) {
      const error = new Error('Email is already taken.')
      error.statusCode = 422
      throw error
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 12)
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
    })

    const response = await user.save()

    res.status(201).json({
      message: 'Registered successfully!',
      userId: response._id,
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    res.status(err.statusCode).json({
      message: err.message,
    })
  }
}

export const login = async (req, res) => {
  try {
    const loadedUser = await User.findOne({ email: req.body.email })
    if (!loadedUser) {
      const error = new Error("User with this email doesn't exist.")
      error.statusCode = 404
      throw error
    }
    const correctPassword = await bcrypt.compare(
      req.body.password,
      loadedUser.password
    )
    if (!correctPassword) {
      const error = new Error('Invalid Password')
      error.statusCode = 401
      throw error
    }

    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser.id.toString(),
      },
      '~5N2wZsiGkP;l_+BeK*{>)y"))C[fM',
      { expiresIn: '1h' }
    )

    res.status(200).json({
      token,
      userId: loadedUser.id.toString(),
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    res.status(err.statusCode).json({
      message: err.message,
    })
  }
}
