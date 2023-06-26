#### Setup Basic Express Server

- [] import express and create an app
- [] setup start port variable (5000) and start function

#### Connect to MongoDB Database

- [] setup a new project on mongodb atlas (cloud version)
- [] get the connect string, store it in .env file and change the password
- [] import dotenv and call config() method to get access to all env variables
- [] create connect method, import it and invoke in the app.js file
- [] restart the server
- [] to work with mongodb, install mongoose v6 package

#### Basic Routes and Middlewares

- [] setup / GET Route
- [] setup express.json() middleware to parse incoming body in json to javascript object
- [] setup 404 and errorHandler middleware
- [] import "express-async-errors" to catch async errors

#### User Model

- [] Create models folder and create UserModel.js file
- [] import mongoose, create user schema with name, email, password (all type: String)
- [] create user model from user schema
- [] export mongoose model

#### Auth Route Structure

- [] create controllers folder
- [] create authController.js file in controllers folder
- [] create register, login, logout as async functions
- [] res.send("some string value")
- [] export all the functions
- [] create routes folder
- [] create authRoute.js file in routes folder
- [] import express.Router() object
- [] import all auth controllers
- [] setup 3 routes for each controller
- [] post('/register), post('/login), post/get('/logout)
- [] export auth router as default
- [] import authRoutes as authRouter in the app.js file
- [] setup app.use('/api/v1/auth',authRouter) middleware

#### Register Controller

- [] import user model
- [] get all incoming request data, make sure to setup express.json() middleware
- [] check email is already in use
- [] ignore role
- [] send response with entire user (while testing)
- [] make first user as admin alse user

#### Hash Password

- [] install bcryptjs package to hash and compare passwords
- [] setup pre hook on userSchema in User.js file
- [] import bcryptjs, hash the password

#### JWT

- [] install jwt package to issue jwt token for user authorization
- [] import jwt package
- [] add JWT_SECRET and JWT_LIFETIME variables to .env file
- [] create jwt - jwt.sign(payload,secret,options)
- [] verify jwt against jwt secret
- [] set it up as a functionin utils
- [] attach token to the cookie by res.cookie(key,value,otions)
- [] setup authCookiesToResponse
- [] accept payload(res,tokenUser)
- [] create token, setup cookie
- [] send back the response or not
- [] pass cookie secret to cookieParser(secret) when cookies are signed
- [] access signed cookies using req.signedCookies

#### Login Routes

- [] check if email and password exist, if one missing send 400
- [] find user, if no user return 401
- [] if you added select : false for the password in user model, make sure to select by select('+password')
- [] check password, if does not match return 401
- [] if everything is correct, attach cookie to the response
- [] send back the same response as in register

#### Logout Route

- [] set token cookie equal to some string value
- [] set expires : new Date(Date.now())

#### User Routes Structure

- [] Add userController.js file
- [] create (getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword) functions and import them
- [] res.send('some string value')
- [] setup userRoutes.js file
- [] import all controllers
- [] setup just one route - router.route('/').get(getAllUsers)
- [] setup app.use('/api/v1/users',userRouter)

#### Get All Users and Get Single User

- [] Get all users where role is "user" and remove password
- [] Get Single user where id matched params id and remove password
- [] If no user 404

#### authenticateUser and authorizePermission Middleware

- [] create authenticateUser middleware in authentication.js file
- [] access the signed cookie by req.signedCookies.token
- [] check token exists or not, if not 401
- [] check token is valid or not , if not 401
- [] set req.user as same as token user
- [] call next middleware
- [] create authorizePermission middleware in authentication.js file
- [] return callback function if u want to pass arguments to middleware in routes
- [] give permission to user based on roles
- [] user is not admin , throw 403 firbidden error

### Show Current User

- [] get user from request object
- [] send response with user

#### Update User Password

- [] almost identicle to login user
- [] add authenticateUser middleware in the route
- [] check for oldPassword and newPassword in the body
- [] if one missing 400
- [] look for user with req.user.userId
- [] if you added select : false for the password in user model, make sure to select by select('+password')
- [] check if oldPassword matches with user.comparePassword
- [] if no match 401
- [] if everything good set user.password equal to newPassword

#### Create Token User in Utils

- [] create a createTokenUser file in utils
- [] setup a function that accepts iuser object and returns userToken object
- [] export as default
- [] setup all the correct import/exports and refactor existing code

#### Update User with User.findOneAndUpdate()

- [] add authentication middleware in the route
- [] check for name and email in the body
- [] if one is missing, send 400 (optional)
- [] use findOneAndUpdate()
- [] create token user, attachKookiesToResponse and send back the tokenuser

#### Update User with user.save();

#### Setup and Apply checkPermissions() to Get Signle User Controller

#### Product Model

- [] create Product.js in models folder
- [] create Schema
- [] name : {type: String}
- [] description : {type: String}
- [] image : {type: String}
- [] category : {type: String}
- [] company : {type: String}
- [] price : {type: Number}
- [] inventory : {type: Number}
- [] averageRating : {type: Number}
- [] colors : {type:[]}
- [] features: {type:Boolean}
- [] freeShipping: {type:Boolean}
- [] user
- [] set timestamps
- [] export Product Model

#### Product Structure

- [] add productController file in controllers
- [] create createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct, uploadImage functions
- [] res.send('function name')
- [] setup productRoute file in routes
- [] import all controllers
- [] only getAllProducts and get SingleProduct accessible to public
- [] rest only by admin(setup middleware)
- [] router.route('/uploadImage').post(uploadImage)
- [] import productRoutes as productRouter in the app.js
- [] setup app.use('/api/v1/products',productRoutes)

#### Create Product

- [] create user property on req.body and set it equal to userId(req.user)
- [] pass re.body into Product.create
- [] send back the product

#### Upload Image

- [] install express-fileupload package
- [] import in app.js
- [] serve public folder as static app.use(express.static("./public"));
- [] setup app.use(fileUpload());
- [] get files on req.files object
- [] in postman select form-data give a "name", select file and upload
- [] get productImage from req.files["name"]
- [] check mimetype is image or not
- [] check for the image size
- [] setup a file path where you want to upload images
- [] move it to that path
- [] send the response

#### Review Model

- [] create Review.js in models folder
- [] create Schema
- [] rating : {type: Number}
- [] title : {type: String}
- [] comment : {type: String}
- [] user
- [] product
- [] set timestamps
- [] export Review model

#### Review Structure

- [] add reviewController file in controllers
- [] export (createReview, getAllReviews, get SingleReview, updateReview, deleteReview) functions
- [] res.send('function name')
- [] setup reviewRoutes file in routes
- [] import all controllers
- [] only getAllReviews and getSingleReview accessible to public
- [] rest only to users (setup middlewares)
- [] typical REST setup
- [] import reviewRoutes as reviewRouter in the app.js
- [] setup app.use('/api/v1/reviews',productRouter)

#### Create Review

- [] check for product in the req.body
- [] attach user property (set it equal to req.user.userId)
- [] create review
- [] don't test yet

#### Get All Reviews and Get Single Review

- [] both public routes, typical setup
- [] chain populate method to get more info about referenced models, populate('modelName', 'fields')

#### Delete Review

- [] get id from req.params
- [] check if review exists
- [] if no review, send 404
- [] check permissions (req.user, review.user)
- [] use await review.remove()
- [] send back 200

#### Update Review

- [] get id from req.params
- [] get {rating,title,comment} from req.body
- [] check if review exists
- [] if no review, send 404
- [] check permission
- [] set review properties equal to rating, title, comment
- [] use await review.save()
- [] send back 200

#### Order Schema

- [] create Order.js file in models folder
- [] create schema
- [] tax : {type: Number}
- [] subtotal : {type: Number}
- [] total : {type: Number}
- [] orderItems : []
- [] status: {type: String}
- [] user
- [] clientSecret: {type: String}
- [] paymentId: {type: String}
- [] set timestamps
- [] export Order Model

#### Order Structure

- [] add orderController file in controllers
- [] export (getAllOrders, getSingleOrder, getCurrentUserOrders, createOrder, updateOrder) functions
- [] res.send('function name')
- [] setup orderRoutes file in routes
- [] aunthenticate user in all routes
- [] getALlOrders admin only
- [] typical REST setup
- [] router.route('/ahowAllMyOrders').get(getCurrentUserOrders)
- [] import orderRoutes as orderRouter in the app.js
- [] setup app.use('/api/v1/orders',orderRouter)

#### Create Order

- [] typical setup

#### Get All Orders and Get Single Order

- [] getAllOrders - admin only
- [] getSingleOrder - checkPermissions

#### Get Current User Orders

- [] find orders where user is equal to req.user.userId

#### Update Order

- [] get order Id
- [] get paymentIntentId (req.body)
- [] get order
- [] if does not exist - 404
- [] check permissions
- [] set paymentIntentId and status as "paid"
- [] order.save()

#### Security Packages

- [] express-rate-limiter
- [] helmet
- [] xss-clean
- [] express-mongo-santize
- [] cors (cookies!!!!)

#### Update User Model

- [] add following three properties
- [] verificationToken - String
- [] isVerified : {type: Boolean}
- [] verified - Date

#### Update register vontroller

- [] setup fake verificationToken - 'fakeToken'
- [] remove everything after User.create()
- [] send back success message and token

#### Update Login Controller

- [] right after isPasswordCorrect
- [] check if user.isVerified, if not 401

### Verify Email Controller

- [] create verifyEmail in authController
- [] get verificationToken and email from req.body
- [] setup a '/verift-email' route in authRoutes
- [] test in a postman
- [] check for user using email
- [] if no user 401
- [] if token does not match user token 401
- [] if correct set
- [] user.isVerified = true
- [] user.verified = Date.now()
- [] user.verificationToken = ''
- [] save user with instance method
- [] return msg : email verified

#### Email Setup

- [] Ethereal Email credentials (create account/login)
- [] install nodemailer
- [] create (nodemailerConfig, sendEmail, sendResetPasswordEmail, sendVerificationEmail) files in utils

#### Token Model

- [] create Token.js in models
- [] refreshToken,ip,userAgent - all String and required
- [] isValid - Boolean, default : true
- [] ref user
- [] timestamps true

#### Forgot and Reset FUnctionality

- [] User model
- [] passwordToken {type: String}
- [] passwordTokenExpirationDate {type: Date}
- [] authController
- [] forgot password and reset pasword
- [] authRoutes
- [] post '/forgot-password' 'reset-password'
