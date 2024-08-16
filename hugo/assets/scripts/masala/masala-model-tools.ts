import { AstNode } from "langium-ast-helper";
import { TreeNode } from "./d3tree";


export function getMainTreeNode(ast: AstNode): TreeNode {
    const astNode = getDomainModelAst(ast as DomainModelAstNode);
    // create a TreeNode a DataType
    const getDataTypeTreeNode = (d: DataType): TreeNode => {
        return {
            ...d,
            children: []
        }
    }

    // create a TreeNode from a PackageDeclaration
    const getPackageDeclarationTreeNode = (p: PackageDeclaration): TreeNode => {
        return {
            ...p,
            children: p.elements.map(e => getTreeNode(e))
        }
    }

    // create a TreeNode from any DomainModelElement
    const getTreeNode = (e: DomainModelElement): TreeNode => {
        switch(e.$type) {
            case 'DataType': return getDataTypeTreeNode(e as DataType);
            case 'Entity': return getEntityTreeNode(e as Entity);
            case 'PackageDeclaration': return getPackageDeclarationTreeNode(e as PackageDeclaration);
            default: return e as TreeNode;
        }
    }

    // create a TreeNode from an Entity
    const getEntityTreeNode = (entity: Entity): TreeNode => {

        // create a TreeNode from a Feature
        const getFeatureTreeNode = (feature: Feature): TreeNode => {
            return {
                name: `${feature.name}${feature.many ? '[]' : ''}`,
                $type: feature.$type,
                tags: feature.many ? ['many'] : [],
                children: [getDataTypeTreeNode(feature.type.ref)]
            }
        }

        // get all children of an Entity (including the supertype)
        const getChildren = (e: Entity): TreeNode[] => {
            const superType = astNode.entities.find(entity => entity.name === e.superType?.ref.name);
            const features = e.features.map(f => getFeatureTreeNode(f));

            const children: TreeNode[] = superType ? [...features, { 
                name:  superType.name, 
                $type: superType.$type,
                tags: ['supertype'],
                children: superType?.features.map(f => getFeatureTreeNode(f) )
            }] : features;

            return children;
        }
        
        return {
            ...entity,
            children: getChildren(entity)
        }
    }

    // create a TreeNode from all Entities in the ast
    const entities = astNode.entities.flatMap(e => getEntityTreeNode(e));
    // create a TreeNode from all DataTypes in the ast
    const datatypes = astNode.dataTypes.map(d => getDataTypeTreeNode(d));
    // create a TreeNode from all PackageDeclarations in the ast
    const packageDeclarations = astNode.packageDeclarations.map(p => getPackageDeclarationTreeNode(p));

    const children: TreeNode[] = [];

    // if datatypes exist, add them to the children
    if(datatypes.length > 0) {
        children.push({ name: 'DataTypes', $type: 'DataType', children: datatypes });
    }

    // if entities exist, add them to the children
    if(entities.length > 0) {
        children.push({name: 'Entities', $type: 'Entity', children: entities});
    }

    // if packageDeclarations exist, add them to the children
    if(packageDeclarations.length > 0) {
        children.push({name: 'Packages', $type: 'PackageDeclaration', children: packageDeclarations});
    }

    
    // return the root TreeNode
    return {
        name: astNode.$type,
        $type: astNode.$type,
        children: children
    }
}

/**
 * Returns a DomainModelAstNode from a given ast.
*/
export function getDomainModelAst(ast: DomainModelAstNode ): DomainModelAstNode {
    return {
        name: ast.name,
        $type: 'Domainmodel',
        elements: ast.elements,
        packageDeclarations: (ast.elements as DomainModelElement[]).filter(e => e.$type === 'PackageDeclaration') as PackageDeclaration[],
        entities: (ast.elements as DomainModelElement[]).filter(e => e.$type === 'Entity') as Entity[],
        dataTypes: (ast.elements as DomainModelElement[]).filter(e => e.$type === 'DataType') as DataType[],
    }
}

// a more accessible representation of the DomainModel Ast
export interface DomainModelAstNode extends AstNode, DomainModelElement {
    $type: 'Domainmodel';
    elements: DomainModelElementType[];

    packageDeclarations: PackageDeclaration[];
    entities: Entity[];
    dataTypes: DataType[];
}

export interface PackageDeclaration extends DomainModelElement  {
    $type: 'PackageDeclaration';
    elements: DomainModelElementType[];
}

export interface Entity extends DomainModelElement  {
    $type: 'Entity';
    features: Feature[];
    superType?: {
        ref: Entity
    }
}

export interface Feature extends DomainModelElement  { 
    $type: 'Feature';
    type: {
        ref: DataType
    };
    many: boolean;
}

export interface DataType extends DomainModelElement {
    $type: 'DataType';
}

export interface DomainModelElement {
    $type: string;
    name: string;
}

// create a union type of all possible DomainModelElement types
export type DomainModelElementType = PackageDeclaration | Entity | DataType | Feature | DomainModelAstNode;

// create a union type of all possible DomainModelElement types names (string)
export type DomainModelElementTypeNames = DomainModelElementType['$type'];

/*
Generate entities and their relationships in below format along with properties and datatypes for each property for "Online Food Delivery Platform (e.g., DoorDash, UberEats)" and do not add any other text.

Output Format:
entity [ENTITY NAME]
{
  [ATTRIBUTE NAME]: [DATA TYPE]
}
*/
export const example = `// Define all datatypes
datatype String
datatype Int
datatype Decimal

package big {
    datatype Int
    datatype Decimal
}

package complex {
    datatype Date
}

// Define all entities 
entity Blog {
    title: String
    date: complex.Date
    many posts: Post
}

entity HasAuthor {
    author: String
}

entity Post extends HasAuthor {
    title: String
    content: String
    many comments: Comment
}

entity Comment extends HasAuthor {
    content: String
}
`;

export const examples = [
`// Ride-Sharing App (e.g., Uber, Lyft)
datatype String
datatype Int
datatype Decimal

package big {
    datatype Int
    datatype Decimal
}

package complex {
    datatype Date
}

// Define all entities 
entity Blog {
    title: String
    date: complex.Date
    many posts: Post
}

entity HasAuthor {
    author: String
}

entity Post extends HasAuthor {
    title: String
    content: String
    many comments: Comment
}

entity Comment extends HasAuthor {
    content: String
}
`,
`
// Online Food Delivery Platform (e.g., DoorDash, UberEats)
entity User
{
userId: string
name: string
email: string
address: string
phoneNumber: string
paymentMethods: array of PaymentMethod
orders: array of Order
}

entity Restaurant
{
restaurantId: string
name: string
address: string
phoneNumber: string
cuisine: string
rating: float
deliveryTime: int
menu: array of MenuItem
orders: array of Order
}

entity MenuItem
{
menuItemId: string
name: string
description: string
price: float
image: string
category: string
restaurant: Restaurant
}

entity Order
{
orderId: string
user: User
restaurant: Restaurant
items: array of OrderItem
total: float
status: string // pending, accepted, preparing, out_for_delivery, delivered, cancelled
createdAt: timestamp
deliveryAddress: string
deliveryTime: timestamp
deliveryFee: float
tip: float
}

entity OrderItem
{
orderItemId: string
menuItem: MenuItem
quantity: int
price: float
}

entity DeliveryPerson
{
deliveryPersonId: string
name: string
phoneNumber: string
location: string
orders: array of Order
}

entity PaymentMethod
{
paymentMethodId: string
type: string // credit card, debit card, cash, etc.
number: string
expiryDate: timestamp
cvv: string
owner: User
default: boolean
}

entity Promotion
{
promotionId: string
code: string
discount: float
expiryDate: timestamp
terms: string
}
`,
`
// Social Media Platform (e.g., Facebook, Instagram)
entity User
{
  user_id: UUID
  name: String
  email: String
  password: String
  profile_picture: String
  bio: String
  created_at: DateTime
}

entity Post
{
  post_id: UUID
  content: String
  media_url: String
  created_at: DateTime
  user_id: UUID
}

entity Comment
{
  comment_id: UUID
  content: String
  created_at: DateTime
  user_id: UUID
  post_id: UUID
}

entity Like
{
  like_id: UUID
  user_id: UUID
  post_id: UUID
  created_at: DateTime
}

entity Follow
{
  follower_id: UUID
  following_id: UUID
  created_at: DateTime
}

entity Message
{
  message_id: UUID
  sender_id: UUID
  receiver_id: UUID
  content: String
  sent_at: DateTime
}

entity Notification
{
  notification_id: UUID
  type: String
  content: String
  user_id: UUID
  created_at: DateTime
}

`,
`
// Video Streaming Service (e.g., Netflix, Hulu)
entity User
{
userId: string
name: string
email: string
password: string
subscription: Subscription
watchHistory: array of Video
favorites: array of Video
playlists: array of Playlist
}

entity Video
{
videoId: string
title: string
description: string
genre: string
releaseDate: timestamp
duration: int
cast: array of string
director: string
producer: string
studio: string
language: string
subtitles: array of string
thumbnail: string
views: int
ratings: float
episodes: array of Episode // for series
}

entity Episode
{
episodeId: string
title: string
description: string
season: int
number: int
duration: int
releaseDate: timestamp
}

entity Subscription
{
subscriptionId: string
plan: string // basic, standard, premium
price: float
startDate: timestamp
endDate: timestamp
user: User
}

entity Playlist
{
playlistId: string
name: string
description: string
owner: User
videos: array of Video
}

entity Genre
{
genreId: string
name: string
description: string
}

entity Actor
{
actorId: string
name: string
bio: string
image: string
movies: array of Video
tvShows: array of Video
}

entity Director
{
directorId: string
name: string
bio: string
image: string
movies: array of Video
}

entity Producer
{
producerId: string
name: string
bio: string
image: string
movies: array of Video
}

entity Studio
{
studioId: string
name: string
description: string
logo: string
movies: array of Video
tvShows: array of Video
}

entity Rating
{
ratingId: string
user: User
video: Video
value: float
}

entity Comment
{
commentId: string
user: User
video: Video
text: string
timestamp: timestamp
likes: int
replies: array of Comment
}
`,
`
// E-commerce Platform (e.g., Amazon, eBay)
entity User
{
  user_id: UUID
  name: String
  email: String
  password: String
  address: String
  phone_number: String
  created_at: DateTime
}

entity Product
{
  product_id: UUID
  name: String
  description: String
  price: Float
  stock_quantity: Integer
  created_at: DateTime
  seller_id: UUID
}

entity Order
{
  order_id: UUID
  order_date: DateTime
  total_amount: Float
  status: String
  user_id: UUID
}

entity OrderItem
{
  order_item_id: UUID
  quantity: Integer
  price: Float
  order_id: UUID
  product_id: UUID
}

entity Payment
{
  payment_id: UUID
  amount: Float
  payment_method: String
  payment_date: DateTime
  order_id: UUID
}

entity Review
{
  review_id: UUID
  rating: Float
  comment: String
  created_at: DateTime
  product_id: UUID
  user_id: UUID
}

entity Category
{
  category_id: UUID
  name: String
  description: String
}

entity ProductCategory
{
  product_id: UUID
  category_id: UUID
}
`,
`
// Cloud Storage Service (e.g., Google Drive, Dropbox)
entity User
{
  user_id: UUID
  name: String
  email: String
  password: String
  created_at: DateTime
}

entity File
{
  file_id: UUID
  name: String
  size: Integer
  type: String
  uploaded_at: DateTime
  user_id: UUID
  folder_id: UUID
}

entity Folder
{
  folder_id: UUID
  name: String
  created_at: DateTime
  user_id: UUID
  parent_folder_id: UUID
}

entity SharedFile
{
  shared_file_id: UUID
  file_id: UUID
  shared_with_user_id: UUID
  shared_at: DateTime
}

entity SharedFolder
{
  shared_folder_id: UUID
  folder_id: UUID
  shared_with_user_id: UUID
  shared_at: DateTime
}

entity Subscription
{
  subscription_id: UUID
  user_id: UUID
  plan: String
  start_date: DateTime
  end_date: DateTime
}
`,
`
// Real-Time Chat Application (e.g., WhatsApp, Slack)
entity User
{
userId: string
username: string
profilePicture: string
status: string
lastSeen: timestamp
}

entity Chat
{
chatId: string
name: string
type: string // group, private
participants: array of User
messages: array of Message
creationTime: timestamp
}

entity Message
{
messageId: string
sender: User
text: string
timestamp: timestamp
type: string // text, image, video, file, etc.
reactions: array of Reaction
}

entity Reaction
{
reactionId: string
user: User
type: string // like, love, haha, etc.
}

entity Group
{
groupId: string
name: string
description: string
admin: User
members: array of User
chats: array of Chat
}

entity File
{
fileId: string
name: string
size: int
type: string // mime type
sender: User
chat: Chat
}

entity Image
{
imageId: string
size: int
type: string // mime type
sender: User
chat: Chat
}

entity Video
{
videoId: string
size: int
type: string // mime type
sender: User
chat: Chat
}

entity Audio
{
audioId: string
size: int
type: string // mime type
sender: User
chat: Chat
}

entity Contact
{
contactId: string
name: string
phoneNumber: string
email: string
profilePicture: string
user: User
}

entity Notification
{
notificationId: string
type: string // message, group invite, etc.
message: string
timestamp: timestamp
user: User
}
`,
`
// Job Search Platform (e.g., LinkedIn, Indeed)
entity User
{
userId: string
name: string
email: string
password: string
location: string
industry: string
skills: array of string
experience: array of JobExperience
education: array of Education
profilePicture: string
resume: string
jobAlerts: array of Job
savedJobs: array of Job
appliedJobs: array of JobApplication
connections: array of User
endorsements: array of Endorsement
}

entity Job
{
jobId: string
title: string
company: Company
location: string
description: string
requirements: string
salary: string
type: string // full-time, part-time, contract, etc.
category: string
postedDate: timestamp
expiryDate: timestamp
applications: array of JobApplication
}

entity Company
{
companyId: string
name: string
size: string
industry: string
location: string
description: string
website: string
logo: string
jobs: array of Job
}

entity JobApplication
{
applicationId: string
user: User
job: Job
status: string // applied, in progress, rejected, offered
appliedDate: timestamp
}

entity JobExperience
{
experienceId: string
title: string
company: Company
location: string
startDate: timestamp
endDate: timestamp
description: string
}

entity Education
{
educationId: string
degree: string
fieldOfStudy: string
school: string
location: string
startDate: timestamp
endDate: timestamp
description: string
}

entity Skill
{
skillId: string
name: string
}

entity Endorsement
{
endorsementId: string
skill: Skill
endorser: User
endorsee: User
}
`,
`
// Online Learning Platform (e.g., Coursera, Udemy)
entity User
{
userId: string
name: string
email: string
password: string
location: string
interests: array of string
enrollments: array of CourseEnrollment
purchasedCourses: array of Course
learningHistory: array of CourseProgress
certificates: array of Certificate
}

entity Course
{
courseId: string
title: string
description: string
instructor: User
category: string
level: string // beginner, intermediate, advanced
price: float
duration: int // in hours
ratings: float
reviews: array of Review
enrollments: array of CourseEnrollment
contents: array of CourseContent
prerequisites: array of Course
}

entity CourseContent
{
contentId: string
type: string // video, text, quiz, assignment, etc.
title: string
description: string
duration: int // in minutes
course: Course
}

entity CourseEnrollment
{
enrollmentId: string
user: User
course: Course
enrollmentDate: timestamp
progress: float
completed: boolean
}

entity Review
{
reviewId: string
user: User
course: Course
rating: int
text: string
timestamp: timestamp
}

entity Certificate
{
certificateId: string
user: User
course: Course
issueDate: timestamp
}

entity Instructor
{
instructorId: string
user: User
courses: array of Course
students: array of User
ratings: float
reviews: array of Review
}

entity Payment
{
paymentId: string
user: User
course: Course
amount: float
currency: string
paymentDate: timestamp
}

entity Notification
{
notificationId: string
user: User
message: string
timestamp: timestamp
read: boolean
}
`,
`
// Online Payment System (e.g., PayPal, Stripe)
entity User
{
userId: string
name: string
email: string
address: string
phoneNumber: string
paymentMethods: array of PaymentMethod
transactions: array of Transaction
}

entity PaymentMethod
{
paymentMethodId: string
type: string // credit card, debit card, bank account, etc.
number: string
expiryDate: timestamp
cvv: string
owner: User
default: boolean
}

entity Transaction
{
transactionId: string
amount: float
currency: string
status: string // pending, completed, failed, refunded
createdAt: timestamp
updatedAt: timestamp
payer: User
payee: User
paymentMethod: PaymentMethod
description: string
}

entity Dispute
{
disputeId: string
transaction: Transaction
reason: string
status: string // open, closed, won, lost
createdAt: timestamp
updatedAt: timestamp
}

entity Refund
{
refundId: string
transaction: Transaction
amount: float
currency: string
status: string // pending, completed
createdAt: timestamp
updatedAt: timestamp
}

entity Fee
{
feeId: string
transaction: Transaction
amount: float
currency: string
type: string // processing fee, currency conversion fee, etc.
createdAt: timestamp
}
`];

export const syntaxHighlighting =  {
    keywords: [
        'datatype','entity','extends','many','package'
    ],
    operators: [
        '.',':'
    ],
    symbols:  /\.|:|\{|\}/,

    tokenizer: {
        initial: [
            { regex: /[_a-zA-Z][\w_]*/, action: { cases: { '@keywords': {"token":"keyword"}, '@default': {"token":"ID"} }} },
            { include: '@whitespace' },
            { regex: /@symbols/, action: { cases: { '@operators': {"token":"operator"}, '@default': {"token":""} }} },
        ],
        whitespace: [
            { regex: /\s+/, action: {"token":"white"} },
            { regex: /\/\*/, action: {"token":"comment","next":"@comment"} },
            { regex: /\/\/[^\n\r]*/, action: {"token":"comment"} },
        ],
        comment: [
            { regex: /[^\/\*]+/, action: {"token":"comment"} },
            { regex: /\*\//, action: {"token":"comment","next":"@pop"} },
            { regex: /[\/\*]/, action: {"token":"comment"} },
        ],
    }
};
