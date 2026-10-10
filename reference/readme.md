# dimension
image dimension - height ,  width  colour
gray  scale  me  colour  nhi  hota hai 

# gray scale  conversion
use color  to  gray  scale 
gray =  cv2.cvtColor(image, cv2,COLOR_BGR2GRAY)

????? image  transformation and  manipulation 
# drawing  shaping

# resizing and  scaling 
resized =  cv2.resize(src, dsize, fx, fy, interpolation)
variable = library.function name (original image ,  dimension (in pixel (width, height)) , quality control  )

# croping image  using  slicing
cropped_image = image[startY:endY, startX:endX]
y-axis = row,
x-axis =  column

# image rotation and  flipping
M = cv2.getRotationMatrix2D(center, angle, scale)
rotated_image = cv2.wrapAffine(image, M , )

center  point = (width//2, height//2)

# basic  image drawing  technique

# drawing  line 
cv2.line(img,pt1,pt2,color,thickness)

# drawing rectangle
cv2.rectangle(img,pt1,pt2,color,thickness)

# drawing circle
cv2.circle(img,centre,redius,color,thickness)

# adding text
cv2.putText(img,text,org,font,fontscale,color,thickness)

# video  processing  workflow

# video  capture
cap = cv2.VideoCapture(source)

what  we  can  do 
1. draw
2. detect
3. analyse


camera - capture , container, release

# saving  video
cv2.videoWriter(file name,codec,fps,frame_size)
codec =  compression  format
fps =  frame  per  second
frame  size  =  height ,  width

# gausian blur
blurred_image = cv2.GaussianBlur(image, (kernal_size_x, kernal_size_y),sigma)
sigma = numeric  value - 0  automatic detect how  much  to  blur

# median blur
blurred = cv2.medianBlur(image, kernal_size)

# sharpening
cv2.filter2D(src, ddepth, kernel)

# canny edge  detection 
edges = cv2.Canny(image, threshold1,threshold2)


# bitwise  op
cv2.bitwise_and(img1,img2)
cv2.bitwise_or(img1,img2)
cv2.bitwise_not(img1)

# contours  and  shape  detection 


# draw  countours
cv2.drawcountours(image,contours,contour_index,color,)
