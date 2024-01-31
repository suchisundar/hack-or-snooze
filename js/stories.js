"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when the site first loads. */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
// if user is logged in, show favorites star icon
  const showStar = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets a list of stories from the server, generates their HTML, and puts them on the page. */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
// vary styles for logged in vs logged out users
  if (currentUser) {
    $allStoriesList.removeClass("logged-out");
    // addFavoriteIcons($allStoriesList);
} else {
    $allStoriesList.addClass("logged-out");
}

  addFavoriteIcons($allStoriesList); // Add 'star' icons to a list of stories

  $allStoriesList.show();
}
/** Gets list of favorite stories from user, generates their HTML, and puts on page. */

function putFavoriteStoriesOnPage() {
  console.debug("putFavoriteStoriesOnPage");

  $favoriteStoriesList.empty();

  // loop through all of the user's favortie stories and generate HTML for them
  for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoriteStoriesList.append($story);
  }

  addFavoriteIcons($favoriteStoriesList);
}


/** Handle submitting new story form. */
async function addStory(event) {
  event.preventDefault();

  const author = $("#story-author").val();
  const title = $("#story-title").val();
  const url = $("#story-url").val();

  // Add story via API
  let newStory = await storyList.addStory(currentUser, { title, author, url });

  // Add story to the current user's ownStories property
  currentUser.ownStories.push(newStory);

  // go back to the main page view
  $submitForm.hide();
  navAllStories();
}

// Add this line to handle submitting the new story form
$submitForm.on("submit", addStory);

//function to delete stories
async function deleteStory() {
  // get the story id associated with the icon
  const storyId = $(this).parent().parent().attr("id");

  console.debug("deleteStory");
  console.debug($(this));
  console.debug($(this).parent().attr("id"));

  // delete the story via API & remove it from the user's stories list
  await currentUser.deleteStory(storyId);

  // refresh the story list so that stories are removed if the user navigates to all stories.
  storyList = await StoryList.getStories();

  // refresh the stories list HTML:
  putUserStoriesOnPage();
}

/* Add 'star' icons to a list of stories so that the user can favorite/unfavorite stories */
function addFavoriteIcons(storyList) {
  console.debug("addFavoriteIcons");

  // loop through all of our stories and generate 'star' icons for the favorites
  for (let story of storyList.children()) {
    const $story = $(story);

    // far = empty/not favorited | fas = full/favorited
    // by default, star icon is empty / story is not a favorite
    let iconType = "far";

    // if the story is in the user's favorites, fill the star icon
    if (storyIsFavorite($story.attr("id"))) {
      iconType = "fas";
    }

    // create star icon and star span
    const starIcon = $("<i>").addClass(`fa-star ${iconType}`);
    const starSpan = $("<span>").addClass("star");

    // add click listener for the star icon:
    starIcon.on("click", toggleFavorite);

    // add star icon to star span, and prepend span to the story li
    starSpan.append(starIcon);
    $story.prepend(starSpan);
  }
}

/** Return whether a story is in the user's favorites */
function storyIsFavorite(storyID) {
  let favoriteIndex = currentUser.favorites.findIndex(function (story) {
    return story.storyId === storyID;
  });

  return favoriteIndex !== -1;
}

/** Toggle whether a story is a user's favorite on the favorite icon click */
async function toggleFavorite() {
  console.debug("toggleFavorite");

  // get the story id associated with the icon
  const storyId = $(this).parent().parent().attr("id");

  try {
    // if the story is one of the user's favorites:
    if (storyIsFavorite(storyId)) {
      // remove the favorite via API and client
      await currentUser.removeFavorite(storyId);

      // empty the star icon
      $(this).addClass("far").removeClass("fas");
    } else {
      // else if the story isn't one of the user's favorites,
      // add the favorite via API and client
     const story = storyList.stories.find (story => story.storyId === storyId);
      await currentUser.addFavorite(story);

      // fill the star icon
      $(this).addClass("fas").removeClass("far");
    }
  } catch (error) {
    // Handle error appropriately (e.g., log, show a user-friendly message)
    console.error("Error toggling favorite:", error);
  }
}

/** This function adds 'trash' icons to the stories list on the 'my stories' view so that the user can delete their stories */
function addTrashIcons() {
  console.debug("addTrashIcons");

  // loop through all of the user's stories and generate 'trash' icons
  for (let story of $myStoriesList.children()) {
    const $story = $(story);

    // create trash icon and span
    const trashIcon = $("<i>").addClass("fas fa-trash-alt");
    const trashSpan = $("<span>").addClass("trash");

    // add click listener for the trash icon:
    trashIcon.on("click", deleteStory);

    // add trash icon to span, and prepend span to the story li
    trashSpan.append(trashIcon);
    $story.prepend(trashSpan);
  }
}

/** This function runs when a 'trash' icon is clicked. It calls the deleteStory method*/
async function deleteStory() {
  // get the story id associated with the icon
  const storyId = $(this).parent().parent().attr("id");

  console.debug("deleteStory");
  console.debug($(this));
  console.debug($(this).parent().attr("id"));

  // delete the story via API & remove it from the user's stories list
  await currentUser.deleteStory(storyId);

  // refresh the story list so that stories are removed if the user navigates to all stories.
  storyList = await StoryList.getStories();

  // refresh the stories list HTML:
  putUserStoriesOnPage();
}

/** This function adds 'pencil' icons to the stories list on the 'my stories' view so that the user can edit their stories */
function addPencilIcons() {
  console.debug("addPencilIcons");

  // loop through all of the user's stories and generate 'pencil' icons
  for (let story of $myStoriesList.children()) {
    const $story = $(story);
    console.log ($story)
    // create pencil icon and span
    const pencilIcon = $("<i>").addClass("fas fa-pencil-alt");
    const pencilSpan = $("<span>").addClass("pencil");

    // add click listener for the pencil icon:
    pencilIcon.on("click", showEditStoryForm);

    // add pencil icon to span, and prepend span to the story li
    pencilSpan.append(pencilIcon);
    $story.prepend(pencilSpan);
  }
}

/** This function runs when a 'pencil' icon is clicked to show and populate the edit story form */
function showEditStoryForm() {
  console.debug("showEditStoryForm");

  // get the story id associated with the icon
  const idToEdit = $(this).parent().parent().attr("id");

  // get the story object given the id
  const storyToEdit = currentUser.ownStories.find((story) => story.storyId === idToEdit);
  console.log(storyToEdit);

  // get the story's author, title, and url
  const author = storyToEdit.author;
  const title = storyToEdit.title;
  const url = storyToEdit.url;

  // show the edit form and add current values from the story
  $editForm.show();

  $("#edit-author").val(author);
  $("#edit-title").val(title);
  $("#edit-url").val(url);

  // add the story id to the edit form
  $editForm.attr("id", idToEdit);
}

/** Run editStory when the edit form submits*/
async function editStory(event) {
  event.preventDefault();

  const author = $("#edit-author").val();
  const title = $("#edit-title").val();
  const url = $("#edit-url").val();
  const storyId = $(this).attr("id");

  // Edit the story via API
  let newStory = await currentUser.editStory(storyId, { title, author, url });

  // Add the story to the current user's ownStories property
  currentUser.ownStories.push(newStory);

  $editForm.hide();
  putUserStoriesOnPage();
}

// Add this line to handle submitting the edit story form
$editForm.on("submit", editStory);

/** Put the User's stories in the $myStoriesList OL */
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $myStoriesList.empty();

  // loop through each user story and generate HTML for them
  for (let story of currentUser.ownStories) {
    console.log(story);
    const $story = generateStoryMarkup(story);
    $myStoriesList.append($story);
  }

  addTrashIcons();
  addPencilIcons();
}

// handle loading more stories (infinite scroll)
// async function loadMoreStories() {
//   try {
//     // Load more stories from the API
//     const newStories = await storyList.loadMoreStories();

//     // If there are new stories, update the UI
//     if (newStories.length > 0) {
//       for (let story of newStories) {
//         const $story = generateStoryMarkup(story);
//         $allStoriesList.append($story);
//       }
//     }
//   } catch (error) {
//     // Handle errors while loading more stories
//     console.error("Error loading more stories:", error);
//   }
// }

// // Add a scroll event listener to implement infinite scroll
// $(window).on("scroll", function () {
//   if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
//     loadMoreStories();
//   }
// });