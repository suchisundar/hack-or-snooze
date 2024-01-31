"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

async function navAllStories() {
  console.debug("navAllStories");
  hidePageComponents();

  // fetch stories from API again to get newly posted stories after session started
  await getAndShowStoriesOnStart();


}

$body.on("click", "#nav-all", navAllStories);

/** Gets list of favorite stories from user, generates their HTML, and puts on page. */

function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoriteStoriesList.empty();

  // loop through all of the user's favortie stories and generate HTML for them
  for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoriteStoriesList.append($story);
  }
  $favoriteStoriesList.show();
    addFavoriteIcons($favoriteStoriesList);
}
/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}
/** When user clicks the Submit nav link, the submit story form should appear */

function showSubmitStoryForm() {
  hidePageComponents();
  console.debug("showSubmitForm");
  $submitForm.show();
}

$navSubmitStory.on("click", showSubmitStoryForm);
/** Show story submit form on clicking story "submit" */

function navSubmitStoryClick(evt) {
  console.debug("navSubmitStoryClick", evt);
  hidePageComponents();
  $allStoriesList.show();
  $submitForm.show();
}

$navSubmitStory.on("click", navSubmitStoryClick);

/** Show favorite stories on click on "favorites" */

function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();
  $favoriteStoriesList.show();
  putFavoritesListOnPage();
}

$navFavorites.on("click", navFavoritesClick);


/** Show My Stories on clicking "my stories" */


function navMyStoriesClick(evt) {
  hidePageComponents();
  console.debug("navMyStoriesClick", evt);
  $myStoriesList.show();
  putUserStoriesOnPage();
}

$navMyStories.on("click", navMyStoriesClick);


/** Hide everything but profile on click on "profile" */

function navProfileClick(evt) {
  console.debug("navProfileClick", evt);
  hidePageComponents();
  $userProfile.show();
}

$navUserProfile.on("click", navProfileClick);

