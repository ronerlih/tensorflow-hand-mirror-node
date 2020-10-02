const similarity = require('compute-cosine-similarity');
const VPTreeFactory = require('vptree');


export default function findSimilar (currentUserPose, poseData) {
   // const poseData = [ […], […], […], …] // an array with all the images’ pose data
   let vptree ; // where we’ll store a reference to our vptree
   
   // Function from the previous section covering cosine distance
   function cosineDistanceMatching(poseVector1, poseVector2) {
       let cosineSimilarity = similarity(poseVector1, poseVector2);
       let distance = 2 * (1 - cosineSimilarity);
       return Math.sqrt(distance);
   }
   
   function buildVPTree() {
     // Initialize our vptree with our images’ pose data and a distance function
     vptree = VPTreeFactory.build(poseData, cosineDistanceMatching);
   }
   
   function findMostSimilarMatch(userPose) {
     // search the vp tree for the image pose that is nearest (in cosine distance) to userPose
     let nearestImage = vptree.search(userPose, 10);
     
     console.log(nearestImage[0].d) // cosine distance value of the nearest match
   
     // return index (in relation to poseData) of nearest match. 
     return nearestImage[0].i; 
   }
   function findMostSimilarTenMatches(userPose) {
      // search the vp tree for the image pose that is nearest (in cosine distance) to userPose
      let nearestImages = vptree.search(userPose, 10);
      
      console.log(poseData[nearestImages[0].i]) // cosine distance value of the nearest match
    
      // return index (in relation to poseData) of nearest match. 
      return nearestImages.map( img => img.i ); 
    }

   // Build the tree once
   buildVPTree();
   
   // Then for each input user pose
   // let currentUserPose = [...] // an L2 normalized vector representing a user pose. 34-float array (17 keypoints x 2).  
   // let closestMatchIndex = findMostSimilarMatch(currentUserPose);
   let closestMatchIndex = findMostSimilarTenMatches(currentUserPose);
   // let closestMatch = poseData[closestMatchIndex];
   
   // console.log(closestMatch);
   return closestMatchIndex;
}