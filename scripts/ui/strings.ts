//
// MIT License
//
// Copyright (c) 2021 TECH ESPM
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// https://github.com/tech-espm/labs-spacetrain
//

class Strings {
	public static LandscapeWarning = "The game works better in landscape mode :)";
	public static OK = "OK";
	public static Cancel = "Cancel";
	public static Clear = "Clear";
	public static Close = "Close";
	public static Exit = "Exit";
	public static Play = "Play";
	public static Menu = "Menu";
	public static Edit = "Edit";
	public static Delete = "Delete";
	public static NextRound = "Next Round";
	public static Finish = "Finish!";
	public static of = "of";
	public static Round = "Round ";
	public static Total = "Total: ";
	public static point = "point";
	public static points = "points";
	public static Install = "Install!";
	public static Oops = "Oops\u2026";
	public static Download = "Download";
	public static About = "About";
	public static PlayMusic = "Play music";
	public static StopMusic = "Stop music";
	public static Fullscreen = "Fullscreen";
	public static START = "START";
	public static RULES = "RULES";
	public static CREDITS = "CREDITS";
	public static Victory = `Your final score was {totalPoints}<br/>
	<br/>
	{regularPoints} points for boarded aliens<br/>
	+<br/>
	{extraPoints} bonus points for `;
	public static VictorySpeciesSingular = ` single species`;
	public static VictorySpeciesPlural = ` different species`;
	public static GameOverReposition = "Repositioning aliens is not allowed!";
	public static GameOverFirstAvailable = "New aliens must always be boarded in the first available position!";
	public static GameOverReplace = "Replacing an already boarded alien is not allowed!";
	public static CreditsHTML = `<h1 class="blue">GAME DESIGN</h2>
	<p>Vince Vader</p>
	<h1 class="green">PROGRAMMING</h2>
	<p>Carlos Rafael das Neves</p>
	<h1 class="orange">CREATIVE COORDINATION</h2>
	<p>Eduardo Manente</p>
	<h1 class="red">PLANNING COORDINATION</h2>
	<p>Eric de Carvalho</p>
	<h1 class="pink">LAYOUT AND SOUNDTRACK</h2>
	<p>Camila Galastri Guedes</p>
	<p>João Pedro Rabelo</p>
	<p>Marcella Lizaso de Siqueira</p>
	<div class="insta">
	<h1>FOLLOW ON INSTAGRAM</h1>
	<p><a target="_blank" href="https://www.instagram.com/gamelab_espm/">@gamelab_espm</a></p>
	<p><a target="_blank" href="https://www.instagram.com/techespm/">@techespm</a></p>
	<p><a target="_blank" href="https://www.instagram.com/arenas_espm/">@arenas_espm</a></p>
	</div>`;

	public static DecimalSeparator = ".";
	public static OppositeDecimalSeparator = ",";
	public static Success = "Success!";
	public static Pause = "Pause";
	public static Restart = "Restart";
	public static Time = "Time";
	public static Name = "Name";

	public static init(): void {
		const language = ((navigator as any)["userLanguage"] as string || navigator.language);
		if (language && language.toLowerCase().indexOf("pt") === 0) {
			document.documentElement.setAttribute("lang", "pt-br");

			Strings.LandscapeWarning = "O jogo funciona melhor no modo paisagem :)";
			//Strings.OK = "OK";
			Strings.Cancel = "Cancelar";
			Strings.Clear = "Limpar";
			Strings.Close = "Fechar";
			Strings.Exit = "Sair";
			Strings.Play = "Jogar";
			//Strings.Menu = "Menu";
			Strings.Edit = "Editar";
			Strings.Delete = "Excluir";
			Strings.NextRound = "Próxima Rodada";
			Strings.Finish = "Terminar!";
			Strings.of = "de";
			Strings.Round = "Rodada ";
			//Strings.Total = "Total: ";
			Strings.point = "ponto";
			Strings.points = "pontos";
			Strings.Install = "Instalar!";
			//Strings.Oops = "Oops\u2026";
			//Strings.Download = "Download";
			Strings.About = "Sobre";
			Strings.PlayMusic = "Tocar música";
			Strings.StopMusic = "Parar música";
			Strings.Fullscreen = "Tela Cheia";
			Strings.START = "INICIAR";
			Strings.RULES = "REGRAS";
			Strings.CREDITS = "CRÉDITOS";
			Strings.Victory = `Sua pontuação final total foi {totalPoints}<br/>
			<br/>
			{regularPoints} pontos de aliens embarcados<br/>
			+<br/>
			{extraPoints} de bônus por `;
			Strings.VictorySpeciesSingular = ` única espécie`;
			Strings.VictorySpeciesPlural = ` espécies diferentes`;
			Strings.GameOverReposition = "Não é permitido reposicionar os alienígenas!";
			Strings.GameOverFirstAvailable = "Um novo alienígena deve sempre ser embarcado na primeira posição disponível!";
			Strings.GameOverReplace = "Não é permitido substituir um alienígina já embarcado!";
			Strings.CreditsHTML = `<h1 class="blue">GAME DESIGN</h2>
			<p>Vince Vader</p>
			<h1 class="green">PROGRAMAÇÃO</h2>
			<p>Carlos Rafael das Neves</p>
			<h1 class="orange">COORDENAÇÃO DE CRIAÇÃO</h2>
			<p>Eduardo Manente</p>
			<h1 class="red">COORDENAÇÃO DE PLANEJAMENTO</h2>
			<p>Eric de Carvalho</p>
			<h1 class="pink">LAYOUT E TRILHA SONORA</h2>
			<p>Camila Galastri Guedes</p>
			<p>João Pedro Rabelo</p>
			<p>Marcella Lizaso de Siqueira</p>
			<div class="insta">
			<h1>SIGA NO INSTA</h1>
			<p><a target="_blank" href="https://www.instagram.com/gamelab_espm/">@gamelab_espm</a></p>
			<p><a target="_blank" href="https://www.instagram.com/techespm/">@techespm</a></p>
			<p><a target="_blank" href="https://www.instagram.com/arenas_espm/">@arenas_espm</a></p>
			</div>`;
		
			Strings.DecimalSeparator = ",";
			Strings.OppositeDecimalSeparator = ".";
			Strings.Success = "Sucesso!";
			Strings.Pause = "Pausa";
			Strings.Restart = "Reiniciar";
			Strings.Time = "Tempo";
			Strings.Name = "Nome";
		}
	}
}
