class BookCard extends CustomElm{
	constructor(book){
		super();
		this.define(html`
			<div>
				<p class="title">${book.title}</p>
				<div class="line"></div>
				<p class="year"><span>${book.year}</span></p>
				<p class="author">${book.author}</p>
				<p class="description">${book.description}</p>
				<div class="options">
					${new ButtonClickable("LISTEN",()=>{
						audio.selectBook(book);
					})}
				</div>
			</div>
		`);
	}
}
defineElm(BookCard,scss`&{
	display:block;
	position:relative;
	background-color:${theme.color.greyStep(1)};
	${theme.boxShadowStep(0)};
	>div{
		position:absolute;
		inset:10px;
		border: 4px solid ${theme.color.greyStep(-1)};
		>p{
			${theme.centerText}
			&.title{
				${theme.font.sizeStep(0)}
				font-weight:700;
			}
			&.year{
				span{
					background-color:${theme.color.greyStep(-1)};
					padding:5px 10px;
					border-radius:100px;
				}
				margin:0;
				margin-top:-17px;
			}
			&.author{
				${theme.font.primary}
				${theme.font.sizeStep(0)}
				margin:0;
				margin-top:5px;
				opacity:.5;
			}
			&.description{
				${theme.font.sizeStep(-1)}
				margin:0 20px;
				margin-top:10px;
			}
		}
		>.line{
			height:4px;
			background-color:${theme.color.greyStep(-1)};
			margin:0 20px;
			margin-top:25px;
			align-self:stretch;
		}
		>.options{
			${theme.center}
			>${ButtonClickable}{
				position:absolute;
				bottom:40px;
			}
		}
	}
}`);
class BookShelf extends CustomElm{
	constructor(books){
		super();
		this.define(html`
			<div>
				${books.map(b=>new BookCard(b))}
			</div>
		`);
	}
}
defineElm(BookShelf,scss`&{
	display:block;
	position:relative;
	>div{
		${theme.centerX}
		flex-wrap:wrap;
		>${BookCard}{
			height:500px;
			width:300px;
			margin:20px;
		}
	}
}`);