function inViewport(t) {
  var o = $(window).height(),
    i = t[0].getBoundingClientRect(),
    n = i.top,
    e = i.bottom;
  return Math.max(0, n > 0 ? o - n : e < o ? e : o);
}
$(window).on("scroll resize", function () {
  var t = inViewport($(".intro"));
  $(".overlay").height(t), $(".caption").css("bottom", t / 4);
});
