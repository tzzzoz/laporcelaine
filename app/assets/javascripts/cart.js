(function($) {
  $('document').ready(function () {
    'use strict';

    Cart.init();
  });

  var Cart = {
    prefix: 'cd-',
    cardName: 'cd-cart',
    $cartTrigger: null,
    $cartContainer: null,
    $shadowLayer: null,
    $cartItems: null,
    $cartTotal: null,
    $priceList: null,

    init: function() {
      'use strict';

      this.storage = localStorage;
      this.total = this.prefix +  'total';
      this.currency = '&euro;';
      this.currencyString = '€';

      this.$cartTrigger = $('#cd-cart-trigger');
      this.$cartContainer = $('#cd-cart');
      this.$shadowLayer = $('#cd-shadow-layer');
      this.$cartItems = $('#cd-cart-items');
      this.$cartTotal = $('#cd-cart-total');
      this.$priceList = $('#price-list');

      this.createCart();
      this.handleAddToCart();
      // this.emptyCart();
      // this.deleteProduct();
      // this.handleCheckout();

      self = this;
      this.$cartTrigger.on('click', function() {
        event.preventDefault();
        self.toggleCart();
      });

      this.$shadowLayer.on('click', function() {
        event.preventDefault();
        self.toggleShadowLayer();
      });

      this.$cartItems.find('li').each(function () {
        var $item = $(this);
        console.log($item);
        var product_id = $item.data().itemId;
      
        $item.find('.cd-item-remove').on('click', function() {
          event.preventDefault();
          self.deleteProduct(product_id);
        });
      });
    },

    createCart: function() {
      if(this.storage.getItem(this.cardName) == null) {
        var cart = {};
        cart.items = {};

        this.storage.setItem(this.cardName, this._toJSONString(cart));
        this.storage.setItem(this.total, '0');
      } else {
        var cart = this._toJSONObject(this.storage.getItem(this.cardName));
        this.renderCart(cart);
      }
    },

    renderCart: function(cart) {
      if (this.$cartContainer.length) {
        var items = cart.items;
        for(var product_id in items) {
          var item = items[product_id];
          this._renderNewItem(product_id, item);
        }
        this._renderTotal();
      }
    },

    toggleCart: function() {
      if (this.$cartContainer.hasClass('speed-in')) {
        this.$cartContainer.removeClass('speed-in').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
          $('body').removeClass('overflow-hidden');
        });
        this.$shadowLayer.removeClass('is-visible');
      } else {
        this.$cartContainer.addClass('speed-in').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
          $('body').addClass('overflow-hidden');
        });
        this.$shadowLayer.addClass('is-visible');
      }
    },

    toggleShadowLayer: function() {
      this.$shadowLayer.removeClass('is-visible');
      // firefox transitions break when parent overflow is changed, so we need to wait for the end of the trasition to give the body an overflow hidden
      if( this.$cartContainer.hasClass('speed-in') ) {
        this.$cartContainer.removeClass('speed-in').on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
          $('body').removeClass('overflow-hidden');
        });
      } else {
        $('body').removeClass('overflow-hidden');
        this.$cartContainer.removeClass('speed-in');
      }
    },

    handleAddToCart: function() {
      var self = this;
      self.$priceList.find('li').each(function() {
        var $item = $(this);
        $item.find('i.add-to-cart').on('click', function() {
          var product_id = $item.data().itemId;
          var product = $item.find('.title').text(); 
          var price = parseFloat($item.find('.price').text());
          var qty = 1;
          var item = {
            product: product,
            price: price,
            qty: qty
          };

          var subTotal = qty * price;
          var total = parseFloat(self.storage.getItem(self.total)) + subTotal;
          self._addToCart(product_id, item);
          self.storage.setItem(self.total, total);

          self.toggleCart();
        });
      });
    },
    deleteProduct: function(product_id) {
      console.log(product_id);
      var cart = this.storage.getItem(this.cardName);
      var cartObject = this._toJSONObject(cart);
      delete cartObject.items[product_id];
      this.storage.setItem(this.cardName, this._toJSONString(cartObject));

      var $cartItem = this.$cartItems.find(`li[data-item-id='${product_id}']`);
      $cartItem.remove();
    },

    // ---------------------------------------------------
    // Helper methods
    _toJSONObject: function(str) {
      var obj = JSON.parse(str);
      return obj;
    },

    _toJSONString: function(obj) {
      var str = JSON.stringify(obj);
      return str;
    },
    _addToCart: function(product_id, item) {
      var cart = this.storage.getItem(this.cardName);

      var cartObject = this._toJSONObject(cart);
      var items = cartObject.items;
      var qty = item.qty;
      var existing_item = items[product_id];
      if (existing_item) {
        // product exists, add qty
        existing_item.qty += qty;
        this._updateItem(product_id, existing_item);
      } else {
        // product doesn't exist, add item to items
        delete item.id;
        items[product_id] = item;
        self._renderNewItem(product_id, item);
      }

      this.storage.setItem(this.cardName, this._toJSONString(cartObject));
    },
    _updateItem: function(product_id, item) {
      var $cartItem = this.$cartItems.find(`li[data-item-id='${product_id}']`);
      var qtyString = item.qty + 'x ';
      var subtotalString = item.price * item.qty + this.currencyString;
      $cartItem.find(".cd-qty").text(qtyString);
      $cartItem.find(".cd-price").text(subtotalString);
    },
    _renderNewItem: function(product_id, item) {
      var self = this;
      var product = item.product;
      var subtotalString = item.price * item.qty + this.currencyString;
      var qtyString = item.qty + 'x ';
      var $cartItem = $("<li>", {text: product, "data-item-id": product_id});
      $cartItem.prepend($("<span>", {class: 'cd-qty', text: qtyString}));
      $cartItem.append($("<div>", {class: 'cd-price', text: subtotalString}));
      var $itemRemove = $('<a class="cd-item-remove cd-img-replace">Remove</a>');
      $itemRemove.on('click', function() {
        event.preventDefault();
        self.deleteProduct(product_id);
      });
      $cartItem.append($itemRemove);
      this.$cartItems.append($cartItem);
    },
    _renderTotal: function() {
      var total_string = this.storage.getItem(this.total) + ' ' + this.currencyString;
      this.$cartTotal.find('span').text(total_string);
    }
  }
}(jQuery));
